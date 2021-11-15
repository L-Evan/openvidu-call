import { Component, EventEmitter, HostListener, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { Subscription } from 'rxjs';
import { LocalUserService } from '../../services/local-user/local-user.service';
import { TokenService } from '../../services/token/token.service';
import { ChatService } from '../../services/chat/chat.service';
import { DocumentService } from '../../services/document/document.service';

import { VideoFullscreenIcon } from '../../models/icon.model';
import { WebrtcService } from '../../services/webrtc/webrtc.service';
import { LoggerService } from '../../services/logger/logger.service';
import { ILogger } from '../../models/logger.model';
import { ScreenType } from '../../models/video-type.model';
import { Publisher, Session } from 'openvidu-browser';
import { ActionService } from '../../services/action/action.service';
import { DeviceService } from '../../services/device/device.service';
import { ChatMessage } from '../../models/chat.model';

@Component({
	selector: 'ov-toolbar',
	templateUrl: './toolbar.component.html',
	styleUrls: ['./toolbar.component.css']
})
export class ToolbarComponent implements OnInit, OnDestroy {
	@Input() compact: boolean;
	@Output() onMicClicked = new EventEmitter<any>();
	@Output() onCamClicked = new EventEmitter<any>();
	@Output() onScreenShareClicked = new EventEmitter<any>();
	@Output() onSpeakerLayoutClicked = new EventEmitter<any>();
	@Output() onLeaveSessionClicked = new EventEmitter<any>();

	sessionId: string;
	session: Session;

	unreadMessages: number;
	messageList: ChatMessage[] = [];
	isChatOpened: boolean;
	isScreenShareEnabled: boolean;
	isWebcamVideoEnabled: boolean;
	isWebcamAudioEnabled: boolean;
	isAutoLayout: boolean;
	isConnectionLost: boolean;
	hasVideoDevices: boolean;
	hasAudioDevices: boolean;

	fullscreenIcon = VideoFullscreenIcon.BIG;
	logoUrl = 'assets/images/openvidu_logo.png';

	participantsNames: string[] = [];

	private log: ILogger;
	private chatServiceSubscription: Subscription;
	private screenShareStateSubscription: Subscription;
	private webcamVideoStateSubscription: Subscription;
	private webcamAudioStateSubscription: Subscription;

	constructor(
		private documentService: DocumentService,
		private chatService: ChatService,
		private tokenService: TokenService,
		private localUsersService: LocalUserService,
		private openViduWebRTCService: WebrtcService,
		private oVDevicesService: DeviceService,
		private actionService: ActionService,
		private loggerSrv: LoggerService
	) {
		this.log = this.loggerSrv.get('ToolbarComponent');
	}

	ngOnDestroy(): void {
		if (this.chatServiceSubscription) {
			this.chatServiceSubscription.unsubscribe();
		}
		if (this.screenShareStateSubscription) {
			this.screenShareStateSubscription.unsubscribe();
		}
		if (this.webcamVideoStateSubscription) {
			this.webcamVideoStateSubscription.unsubscribe();
		}
		if (this.webcamAudioStateSubscription) {
			this.webcamAudioStateSubscription.unsubscribe();
		}
	}

	@HostListener('window:resize', ['$event'])
	sizeChange(event) {
		const maxHeight = window.screen.height;
		const maxWidth = window.screen.width;
		const curHeight = window.innerHeight;
		const curWidth = window.innerWidth;
		if (maxWidth !== curWidth && maxHeight !== curHeight) {
			this.fullscreenIcon = VideoFullscreenIcon.BIG;
		}
	}

	async ngOnInit() {
		await this.oVDevicesService.initDevices();
		this.hasVideoDevices = this.oVDevicesService.hasVideoDeviceAvailable();
		this.hasAudioDevices = this.oVDevicesService.hasAudioDeviceAvailable();

		this.sessionId = this.tokenService.getSessionId();
		this.session = this.openViduWebRTCService.getWebcamSession();

		this.chatServiceSubscription = this.chatService.toggleChatObs.subscribe((opened) => {
			if (opened) {
				this.unreadMessages = 0;
			}
			this.isChatOpened = opened;
		});

		this.chatServiceSubscription = this.chatService.messagesObs.subscribe((messages) => {
			if (!this.isChatOpened) {
				this.unreadMessages = messages.length - this.messageList.length;
			}
			this.messageList = messages;
		});

		this.screenShareStateSubscription = this.localUsersService.screenShareState.subscribe((enabled) => {
			this.isScreenShareEnabled = enabled;
		});

		this.webcamVideoStateSubscription = this.localUsersService.webcamVideoActive.subscribe((enabled) => {
			this.isWebcamVideoEnabled = enabled;
		});
		this.webcamAudioStateSubscription = this.localUsersService.webcamAudioActive.subscribe((enabled) => {
			this.isWebcamAudioEnabled = enabled;
		});
	}

	toggleMicrophone() {
		this.onMicClicked.emit();

		if (this.localUsersService.isWebCamEnabled()) {
			this.openViduWebRTCService.publishWebcamAudio(!this.localUsersService.hasWebcamAudioActive());
			return;
		}
		this.openViduWebRTCService.publishScreenAudio(!this.localUsersService.hasScreenAudioActive());
	}

	async toggleCamera() {
		this.onCamClicked.emit();

		const publishVideo = !this.localUsersService.hasWebcamVideoActive();

		// Disabling webcam
		if (this.localUsersService.areBothConnected()) {
			this.openViduWebRTCService.publishWebcamVideo(publishVideo);
			this.localUsersService.disableWebcamUser();
			this.openViduWebRTCService.unpublishWebcamPublisher();
			return;
		}
		// Enabling webcam
		if (this.localUsersService.isOnlyScreenConnected()) {
			const hasAudio = this.localUsersService.hasScreenAudioActive();

			if (!this.openViduWebRTCService.isWebcamSessionConnected()) {
				await this.connectScreenSession();
			}
			await this.openViduWebRTCService.publishWebcamPublisher();
			this.openViduWebRTCService.publishScreenAudio(false);
			this.openViduWebRTCService.publishWebcamAudio(hasAudio);
			this.localUsersService.enableWebcamUser();
		}
		// Muting/unmuting webcam
		this.openViduWebRTCService.publishWebcamVideo(publishVideo);
	}

	async toggleScreenShare() {
		this.onScreenShareClicked.emit();

		// Disabling screenShare
		if (this.localUsersService.areBothConnected()) {
			this.localUsersService.disableScreenUser();
			this.openViduWebRTCService.unpublishScreenPublisher();
			return;
		}

		// Enabling screenShare
		if (this.localUsersService.isOnlyWebcamConnected()) {
			const screenPublisher = this.initScreenPublisher();

			screenPublisher.once('accessAllowed', async (event) => {
				// Listen to event fired when native stop button is clicked
				screenPublisher.stream
					.getMediaStream()
					.getVideoTracks()[0]
					.addEventListener('ended', () => {
						this.log.d('Clicked native stop button. Stopping screen sharing');
						this.toggleScreenShare();
					});
				this.log.d('ACCESS ALOWED screenPublisher');
				this.localUsersService.enableScreenUser(screenPublisher);

				if (!this.openViduWebRTCService.isScreenSessionConnected()) {
					await this.connectScreenSession();
				}
				await this.openViduWebRTCService.publishScreenPublisher();
				this.openViduWebRTCService.sendNicknameSignal();
				if (!this.localUsersService.hasWebcamVideoActive()) {
					// Disabling webcam
					this.localUsersService.disableWebcamUser();
					this.openViduWebRTCService.unpublishWebcamPublisher();
				}
			});

			screenPublisher.once('accessDenied', (error: any) => {
				this.log.e(error);
				if (error && error.name === 'SCREEN_SHARING_NOT_SUPPORTED') {
					this.actionService.openDialog('Error sharing screen', 'Your browser does not support screen sharing');
				}
			});
			return;
		}

		// Disabling screnShare and enabling webcam
		const hasAudio = this.localUsersService.hasScreenAudioActive();
		await this.openViduWebRTCService.publishWebcamPublisher();
		this.openViduWebRTCService.publishScreenAudio(false);
		this.openViduWebRTCService.publishWebcamAudio(hasAudio);
		this.localUsersService.enableWebcamUser();
		this.localUsersService.disableScreenUser();
		this.openViduWebRTCService.unpublishScreenPublisher();
	}

	toggleSpeakerLayout() {
		console.warn('disabled');
		// this.onSpeakerLayoutClicked.emit();

		// if (!this.localUsersService.isScreenShareEnabled()) {
		// 	this.isAutoLayout = !this.isAutoLayout;

		// 	this.log.d('Automatic Layout ', this.isAutoLayout ? 'Disabled' : 'Enabled');
		// 	if (this.isAutoLayout) {
		// 		this.subscribeToSpeechDetection();
		// 		return;
		// 	}
		// 	this.log.d('Unsubscribe to speech detection');
		// 	this.session.off('publisherStartSpeaking');
		// 	this.resetAllBigElements();
		// 	this.layoutService.update();
		// 	return;
		// }
		// this.log.w('Screen is enabled. Speech detection has been rejected');
	}

	leaveSession() {
		this.log.d('Leaving session...');
		this.openViduWebRTCService.disconnect();
		this.onLeaveSessionClicked.emit();
	}

	toggleChat() {
		this.chatService.toggleChat();
	}

	toggleFullscreen() {
		this.documentService.toggleFullscreen('videoRoomNavBar');
		this.fullscreenIcon = this.fullscreenIcon === VideoFullscreenIcon.BIG ? VideoFullscreenIcon.NORMAL : VideoFullscreenIcon.BIG;
	}

	private async connectScreenSession() {
		try {
			await this.openViduWebRTCService.connectScreenSession(this.tokenService.getScreenToken());
		} catch (error) {
			// this._error.emit({ error: error.error, messgae: error.message, code: error.code, status: error.status });
			this.log.e('There was an error connecting to the session:', error.code, error.message);
			this.actionService.openDialog('There was an error connecting to the session:', error?.error || error?.message);
		}
	}

	private initScreenPublisher(): Publisher {
		const videoSource = ScreenType.SCREEN;
		const audioSource = this.hasAudioDevices ? undefined : null;
		const willThereBeWebcam = this.localUsersService.isWebCamEnabled() && this.localUsersService.hasWebcamVideoActive();
		const hasAudio = willThereBeWebcam ? false : this.hasAudioDevices && this.localUsersService.hasWebcamAudioActive();
		const properties = this.openViduWebRTCService.createPublisherProperties(videoSource, audioSource, true, hasAudio, false);
		return this.openViduWebRTCService.initPublisher(undefined, properties);
	}

	// private subscribeToSpeechDetection() {
	// 	this.log.d('Subscribe to speech detection', this.session);
	// 	// Has been mandatory change the user zoom property here because of
	// 	// zoom icons and cannot handle publisherStartSpeaking event in other component
	// 	this.session.on('publisherStartSpeaking', (event: PublisherSpeakingEvent) => {
	// 		const someoneIsSharingScreen =
	// 			this.remoteUsersService.someoneIsSharingScreen() && this.localUsersService.isScreenShareEnabled();
	// 		if (!someoneIsSharingScreen) {
	// 			const elem = event.connection.stream.streamManager.videos[0].video;
	// 			const element = this.documentService.getHTMLElementByClassName(elem, LayoutType.ROOT_CLASS);
	// 			this.remoteUsersService.setUserZoom(event.connection.connectionId, true);
	// 			this.onToggleVideoSize({ element, resetAll: true });
	// 		}
	// 	});
	// }

	// private resetAllBigElements() {
	// 	this.documentService.removeAllBigElementClass();
	// 	this.remoteUsersService.resetUsersZoom();
	// 	this.localUsersService.resetUsersZoom();
	// }

	// onToggleVideoSize(event: { element: HTMLElement; connectionId?: string; resetAll?: boolean }) {
	// 	const element = event.element;
	// 	if (!!event.resetAll) {
	// 		this.resetAllBigElements();
	// 	}

	// 	this.documentService.toggleBigElementClass(element);

	// 	// Has been mandatory change the user zoom property here because of
	// 	// zoom icons and cannot handle publisherStartSpeaking event in other component
	// 	if (!!event?.connectionId) {
	// 		if (this.openViduWebRTCService.isMyOwnConnection(event.connectionId)) {
	// 			this.localUsersService.toggleZoom(event.connectionId);
	// 		} else {
	// 			this.remoteUsersService.toggleUserZoom(event.connectionId);
	// 		}
	// 	}
	// 	this.layoutService.update();
	// }
}
