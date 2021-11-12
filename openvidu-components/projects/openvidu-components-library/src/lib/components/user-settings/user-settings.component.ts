import { Component, ElementRef, EventEmitter, HostListener, Input, OnDestroy, OnInit, Output, ViewChild } from '@angular/core';
import { FormControl, Validators } from '@angular/forms';
import { ActivatedRoute, Params } from '@angular/router';
import { Subscription } from 'rxjs';

import { OpenViduErrorName } from 'openvidu-browser/lib/OpenViduInternal/Enums/OpenViduError';
import { Publisher } from 'openvidu-browser';

import { ILogger } from '../../models/logger.model';
import { CameraType, IDevice } from '../../models/device.model';
import { AvatarType } from '../../models/chat.model';
import { UserModel } from '../../models/user.model';
import { ExternalConfigModel } from '../../models/external-config.model';
import { SettingsModel } from '../../models/settings.model';
import { Storage } from '../../models/storage.model';
import { ScreenType } from '../../models/video-type.model';

import { NicknameMatcher } from '../../matchers/nickname.matcher';

import { DeviceService } from '../../services/device/device.service';
import { LoggerService } from '../../services/logger/logger.service';
import { StorageService } from '../../services/storage/storage.service';
import { AvatarService } from '../../services/avatar/avatar.service';
import { LocalUserService } from '../../services/local-user/local-user.service';
import { UtilsService } from '../../services/utils/utils.service';
import { WebrtcService } from '../../services/webrtc/webrtc.service';
import { TokenService } from '../../services/token/token.service';


@Component({
	selector: 'ov-user-settings',
	templateUrl: './user-settings.component.html',
	styleUrls: ['./user-settings.component.css']
})
export class UserSettingsComponent implements OnInit, OnDestroy {
	@ViewChild('bodyCard') bodyCard: ElementRef;
	@Input() externalConfig: ExternalConfigModel;
	@Input() ovSettings: SettingsModel;
	@Output() onJoinClicked = new EventEmitter<any>();
	@Output() onCloseClicked = new EventEmitter<any>();

	mySessionId: string;

	cameras: IDevice[];
	microphones: IDevice[];
	camSelected: IDevice;
	micSelected: IDevice;
	isVideoActive = true;
	isAudioActive = true;
	screenShareEnabled: boolean;
	localUsers: UserModel[] = [];
	openviduAvatar: string;
	capturedAvatar: string;
	avatarTypeEnum = AvatarType;
	avatarSelected: AvatarType;
	columns: number;

	nicknameFormControl = new FormControl('', [Validators.maxLength(25), Validators.required]);
	matcher = new NicknameMatcher();
	hasVideoDevices: boolean;
	hasAudioDevices: boolean;
	private log: ILogger;

	private oVUsersSubscription: Subscription;
	private screenShareStateSubscription: Subscription;

	constructor(
		private route: ActivatedRoute,
		private utilsSrv: UtilsService,
		private deviceSrv: DeviceService,
		private loggerSrv: LoggerService,
		private openViduWebRTCService: WebrtcService,
		private tokenService: TokenService,
		private localUsersService: LocalUserService,
		private storageSrv: StorageService,
		private avatarService: AvatarService
		) {
			this.log = this.loggerSrv.get('UserSettingsComponent');

		}

	@HostListener('window:beforeunload')
	beforeunloadHandler() {
		this.close();
	}

	async ngOnInit() {
		this.subscribeToLocalUsersEvents();
		this.initNicknameAndSubscribeToChanges();
		this.openviduAvatar = this.avatarService.getOpenViduAvatar();
		this.columns = window.innerWidth > 900 ? 2 : 1;
		this.setSessionName();
		await this.deviceSrv.initDevices();
		this.setDevicesInfo();
		if (this.hasAudioDevices || this.hasVideoDevices) {
			await this.initwebcamPublisher();
		}
	}

	ngOnDestroy() {
		if (this.oVUsersSubscription) {
			this.oVUsersSubscription.unsubscribe();
		}

		if (this.screenShareStateSubscription) {
			this.screenShareStateSubscription.unsubscribe();
		}
		this.deviceSrv.clear();
	}

	async onCameraSelected(event: any) {
		const videoSource = event?.value;
		if (!!videoSource) {
			// Is New deviceId different from the old one?
			if (this.deviceSrv.needUpdateVideoTrack(videoSource)) {
				const mirror = this.deviceSrv.cameraNeedsMirror(videoSource);
				await this.openViduWebRTCService.replaceTrack(videoSource, null, mirror);
				this.deviceSrv.setCamSelected(videoSource);
				this.camSelected = this.deviceSrv.getCamSelected();
			}
			// Publish Webcam
			this.openViduWebRTCService.publishWebcamVideo(true);
			this.isVideoActive = true;
			return;
		}
		// Unpublish webcam
		this.openViduWebRTCService.publishWebcamVideo(false);
		this.isVideoActive = false;
	}

	async onMicrophoneSelected(event: any) {
		const audioSource = event?.value;

		if (!!audioSource) {
			// Is New deviceId different than older?
			if (this.deviceSrv.needUpdateAudioTrack(audioSource)) {
				console.log(this.camSelected);
				const mirror = this.deviceSrv.cameraNeedsMirror(this.camSelected.device);
				await this.openViduWebRTCService.replaceTrack(null, audioSource, mirror);
				this.deviceSrv.setMicSelected(audioSource);
				this.micSelected = this.deviceSrv.getMicSelected();
			}
			// Publish microphone
			this.publishAudio(true);
			this.isAudioActive = true;
			return;
		}
		// Unpublish microhpone
		this.publishAudio(false);
		this.isAudioActive = false;
	}

	toggleCam() {
		this.isVideoActive = !this.isVideoActive;
		this.openViduWebRTCService.publishWebcamVideo(this.isVideoActive);

		if (this.localUsersService.areBothConnected()) {
			this.localUsersService.disableWebcamUser();
			this.openViduWebRTCService.publishScreenAudio(this.isAudioActive);
		} else if (this.localUsersService.isOnlyScreenConnected()) {
			this.localUsersService.enableWebcamUser();
		}
	}

	toggleScreenShare() {
		// Disabling screenShare
		if (this.localUsersService.areBothConnected()) {
			this.localUsersService.disableScreenUser();
			return;
		}

		// Enabling screenShare
		if (this.localUsersService.isOnlyWebcamConnected()) {
			const screenPublisher = this.initScreenPublisher();

			screenPublisher.on('accessAllowed', (event) => {
				screenPublisher.stream
					.getMediaStream()
					.getVideoTracks()[0]
					.addEventListener('ended', () => {
						this.log.d('Clicked native stop button. Stopping screen sharing');
						this.toggleScreenShare();
					});
				this.localUsersService.enableScreenUser(screenPublisher);
				if (!this.localUsersService.hasWebcamVideoActive()) {
					this.localUsersService.disableWebcamUser();
				}
			});

			screenPublisher.on('accessDenied', (event) => {
				this.log.w('ScreenShare: Access Denied');
			});
			return;
		}

		// Disabling screnShare and enabling webcam
		this.localUsersService.enableWebcamUser();
		this.localUsersService.disableScreenUser();
	}

	toggleMic() {
		this.isAudioActive = !this.isAudioActive;
		this.publishAudio(this.isAudioActive);
	}

	captureAvatar() {
		this.capturedAvatar = this.avatarService.createCapture();
	}

	initNicknameAndSubscribeToChanges() {
		if (this.externalConfig) {
			this.nicknameFormControl.setValue(this.externalConfig.getNickname());
			this.localUsersService.updateUsersNickname(this.externalConfig.getNickname());
			return;
		}
		const nickname = this.storageSrv.get(Storage.USER_NICKNAME) || this.utilsSrv.generateNickname();
		this.nicknameFormControl.setValue(nickname);
		this.localUsersService.updateUsersNickname(nickname);

		this.nicknameFormControl.valueChanges.subscribe((value) => {
			this.localUsersService.updateUsersNickname(value);
			this.storageSrv.set(Storage.USER_NICKNAME, value);
		});
	}

	eventKeyPress(event) {
		if (event && event.keyCode === 13 && this.nicknameFormControl.valid) {
			this.joinSession();
		}
	}

	onResize(event) {
		this.columns = event.target.innerWidth > 900 ? 2 : 1;
	}

	joinSession() {
		if (this.nicknameFormControl.valid) {
			this.avatarService.setFinalAvatar(this.avatarSelected);
			return this.onJoinClicked.emit();
		}
		this.scrollToBottom();
	}

	close() {
		this.onCloseClicked.emit();
	}

	onSelectAvatar(type: AvatarType) {
		this.avatarSelected = type;
	}

	private setDevicesInfo() {
		this.hasVideoDevices = this.deviceSrv.hasVideoDeviceAvailable();
		this.hasAudioDevices = this.deviceSrv.hasAudioDeviceAvailable();
		this.microphones = this.deviceSrv.getMicrophones();
		this.cameras = this.deviceSrv.getCameras();
		this.camSelected = this.deviceSrv.getCamSelected();
		this.micSelected = this.deviceSrv.getMicSelected();
	}

	private setSessionName() {
		this.route.params.subscribe((params: Params) => {
			this.mySessionId = this.externalConfig ? this.externalConfig.getSessionName() : params.roomName;
			this.tokenService.setSessionId(this.mySessionId);
		});
	}

	private scrollToBottom(): void {
		try {
			this.bodyCard.nativeElement.scrollTop = this.bodyCard.nativeElement.scrollHeight;
		} catch (err) {}
	}

	private initScreenPublisher(): Publisher {
		const videoSource = ScreenType.SCREEN;
		const audioSource = this.hasAudioDevices ? undefined : null;
		const willThereBeWebcam = this.localUsersService.isWebCamEnabled() && this.localUsersService.hasWebcamVideoActive();
		const hasAudio = willThereBeWebcam ? false : this.hasAudioDevices && this.isAudioActive;
		const properties = this.openViduWebRTCService.createPublisherProperties(videoSource, audioSource, true, hasAudio, false);

		try {
			return this.openViduWebRTCService.initPublisher(undefined, properties);
		} catch (error) {
			this.log.e(error);
			this.utilsSrv.handlerScreenShareError(error);
		}
	}

	private publishAudio(audio: boolean) {
		this.localUsersService.isWebCamEnabled()
			? this.openViduWebRTCService.publishWebcamAudio(audio)
			: this.openViduWebRTCService.publishScreenAudio(audio);
	}

	private subscribeToLocalUsersEvents() {
		this.oVUsersSubscription = this.localUsersService.OVUsers.subscribe((users) => {
			this.localUsers = users;
		});
		this.screenShareStateSubscription = this.localUsersService.screenShareState.subscribe((enabled) => {
			this.screenShareEnabled = enabled;
		});
	}

	private async initwebcamPublisher() {
		const micStorageDevice = this.micSelected?.device || undefined;
		const camStorageDevice = this.camSelected?.device || undefined;

		const videoSource = this.hasVideoDevices ? camStorageDevice : false;
		const audioSource = this.hasAudioDevices ? micStorageDevice : false;
		const publishAudio = this.hasAudioDevices ? this.isAudioActive : false;
		const publishVideo = this.hasVideoDevices ? this.isVideoActive : false;
		const mirror = this.camSelected && this.camSelected.type === CameraType.FRONT;
		const properties = this.openViduWebRTCService.createPublisherProperties(
			videoSource,
			audioSource,
			publishVideo,
			publishAudio,
			mirror
		);
		if (this.hasAudioDevices || this.hasVideoDevices) {
			const publisher = this.openViduWebRTCService.initPublisher(undefined, properties);
			this.localUsersService.setWebcamPublisher(publisher);
			this.handlePublisherSuccess(publisher);
			this.handlePublisherError(publisher);
		} else {
			this.localUsersService.setWebcamPublisher(null);
			if (this.ovSettings.isAutoPublish()) {
				this.joinSession();
			}
		}
	}


	private handlePublisherSuccess(publisher: Publisher) {
		publisher.once('accessAllowed', async () => {
			// TODO: Think about how handle autopublish
			// if (this.ovSettings.isAutoPublish()) {
			// 	this.joinSession();
			// 	return;
			// }
			if (this.deviceSrv.areEmptyLabels()) {
				await this.deviceSrv.initDevices();
				if (this.hasAudioDevices) {
					const audioLabel = publisher?.stream?.getMediaStream()?.getAudioTracks()[0]?.label;
					this.deviceSrv.setMicSelected(audioLabel);
				}

				if (this.hasVideoDevices) {
					const videoLabel = publisher?.stream?.getMediaStream()?.getVideoTracks()[0]?.label;
					this.deviceSrv.setCamSelected(videoLabel);
				}
				this.setDevicesInfo();
			}
		});
	}

	private handlePublisherError(publisher: Publisher) {
		publisher.once('accessDenied', (e: any) => {
			let message: string;
			if (e.name === OpenViduErrorName.DEVICE_ALREADY_IN_USE) {
				this.log.w('Video device already in use. Disabling video device...');
				// Allow access to the room with only mic if camera device is already in use
				this.hasVideoDevices = false;
				this.deviceSrv.disableVideoDevices();
				return this.initwebcamPublisher();
			}
			if (e.name === OpenViduErrorName.DEVICE_ACCESS_DENIED) {
				message = 'Access to media devices was not allowed.';
				this.hasVideoDevices = false;
				this.hasAudioDevices = false;
				this.deviceSrv.disableVideoDevices();
				this.deviceSrv.disableAudioDevices();
				return this.initwebcamPublisher();
			} else if (e.name === OpenViduErrorName.NO_INPUT_SOURCE_SET) {
				message = 'No video or audio devices have been found. Please, connect at least one.';
			}
			this.utilsSrv.showErrorMessage(e.name.replace(/_/g, ' '), message, true);
			this.log.e(e.message);
		});
	}
}
