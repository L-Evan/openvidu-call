import { Component, EventEmitter, HostListener, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { Subscription } from 'rxjs';
import { LocalUserService } from '../../services/local-user/local-user.service';
import { TokenService } from '../../services/token/token.service';
import { ActionService } from '../../services/action/action.service';
import { ChatService } from '../../services/chat/chat.service';

import { VideoFullscreenIcon } from '../../models/icon.model';
import { SettingsModel } from '../../models/settings.model';

@Component({
	selector: 'ov-toolbar',
	templateUrl: './toolbar.component.html',
	styleUrls: ['./toolbar.component.css']
})
export class ToolbarComponent implements OnInit, OnDestroy {
	@Input() lightTheme: boolean;
	@Input() compact: boolean;
	@Input() showNotification: boolean;
	@Input() ovSettings: SettingsModel;

	@Input() isWebcamAudioEnabled: boolean;
	@Input() isAutoLayout: boolean;
	@Input() isConnectionLost: boolean;
	@Input() hasVideoDevices: boolean;
	@Input() hasAudioDevices: boolean;
	@Output() micButtonClicked = new EventEmitter<any>();
	@Output() camButtonClicked = new EventEmitter<any>();
	@Output() screenShareClicked = new EventEmitter<any>();
	@Output() layoutButtonClicked = new EventEmitter<any>();
	@Output() leaveSessionButtonClicked = new EventEmitter<any>();

	sessionId: string;

	newMessagesNum: number;
	isScreenShareEnabled: boolean;
	isWebcamVideoEnabled: boolean;

	fullscreenIcon = VideoFullscreenIcon.BIG;
	logoUrl = 'assets/images/openvidu_logo.png';

	participantsNames: string[] = [];

	private chatServiceSubscription: Subscription;
	private screenShareStateSubscription: Subscription;
	private webcamVideoStateSubscription: Subscription;

	constructor(
		private actionSrv: ActionService,
		private chatService: ChatService,
		private tokenService: TokenService,
		private localUsersService: LocalUserService
	) {}

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

	ngOnInit() {
		this.sessionId = this.tokenService.getSessionId();

		this.chatServiceSubscription = this.chatService.messagesUnreadObs.subscribe((num) => {
			this.newMessagesNum = num;
		});

		this.screenShareStateSubscription = this.localUsersService.screenShareState.subscribe((enabled) => {
			this.isScreenShareEnabled = enabled;
		});

		this.webcamVideoStateSubscription = this.localUsersService.webcamVideoActive.subscribe((enabled) => {
			this.isWebcamVideoEnabled = enabled;
		});
		if (this.lightTheme) {
			this.logoUrl = 'assets/images/openvidu_logo_grey.png';
		}
	}

	toggleMicrophone() {
		this.micButtonClicked.emit();
	}

	toggleCamera() {
		this.camButtonClicked.emit();
	}

	toggleScreenShare() {
		this.screenShareClicked.emit();
	}

	toggleSpeakerLayout() {
		this.layoutButtonClicked.emit();
	}

	leaveSession() {
		this.leaveSessionButtonClicked.emit();
	}

	toggleChat() {
		this.chatService.toggleChat();
	}

	toggleFullscreen() {
		this.actionSrv.toggleFullscreen('videoRoomNavBar');
		this.fullscreenIcon = this.fullscreenIcon === VideoFullscreenIcon.BIG ? VideoFullscreenIcon.NORMAL : VideoFullscreenIcon.BIG;
	}
}
