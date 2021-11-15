import { Component, ElementRef, HostListener, Input, OnInit, ViewChild, ViewContainerRef } from '@angular/core';
import { FormControl, Validators } from '@angular/forms';
import { MatMenuPanel, MatMenuTrigger } from '@angular/material/menu';
import { NicknameMatcher } from '../../matchers/nickname.matcher';
import { VideoFullscreenIcon, VideoSizeIcon } from '../../models/icon.model';
import { LayoutType } from '../../models/layout.model';
import { UserModel } from '../../models/user.model';
import { VideoType } from '../../models/video-type.model';
import { Storage } from '../../models/storage.model';
import { DocumentService } from '../../services/document/document.service';
import { CdkOverlayService } from '../../services/cdk-overlay/cdk-overlay.service';
import { WebrtcService } from '../../services/webrtc/webrtc.service';
import { LayoutService } from '../../services/layout/layout.service';
import { LocalUserService } from '../../services/local-user/local-user.service';
import { RemoteUserService } from '../../services/remote-user/remote-user.service';
import { StorageService } from '../../services/storage/storage.service';

@Component({
	selector: 'ov-participant',
	templateUrl: './participant.component.html',
	styleUrls: ['./participant.component.css']
})
export class ParticipantComponent implements OnInit {
	videoSizeIconEnum = VideoSizeIcon;
	videoFullscreenIconEnum = VideoFullscreenIcon;
	videoTypeEnum = VideoType;
	videoSizeIcon: VideoSizeIcon = VideoSizeIcon.BIG;
	fullscreenIcon: VideoFullscreenIcon = VideoFullscreenIcon.BIG;
	mutedSound: boolean;
	toggleNickname: boolean;
	isFullscreen: boolean;

	nicknameFormControl: FormControl;
	matcher: NicknameMatcher;

	_user: UserModel;

	@ViewChild('streamComponent', { read: ViewContainerRef }) streamComponent: ViewContainerRef;
	@ViewChild(MatMenuTrigger) public menuTrigger: MatMenuTrigger;
	@ViewChild('menu') menu: MatMenuPanel;

	constructor(
		private documentService: DocumentService,
		private openViduWebRTCService: WebrtcService,
		private layoutService: LayoutService,
		private localUserService: LocalUserService,
		private remoteUserService: RemoteUserService,
		private storageService: StorageService,
		private cdkSrv: CdkOverlayService
	) {}

	@HostListener('window:resize', ['$event'])
	sizeChange(event) {
		const maxHeight = window.screen.height;
		const maxWidth = window.screen.width;
		const curHeight = window.innerHeight;
		const curWidth = window.innerWidth;
		if (maxWidth !== curWidth && maxHeight !== curHeight) {
			this.isFullscreen = false;
			this.videoSizeIcon = VideoSizeIcon.BIG;
		}
	}

	@HostListener('document:fullscreenchange', ['$event'])
	@HostListener('document:webkitfullscreenchange', ['$event'])
	@HostListener('document:mozfullscreenchange', ['$event'])
	@HostListener('document:MSFullscreenChange', ['$event'])
	onFullscreenHandler(event) {
		this.toggleFullscreenIcon();
	}

	// Has been mandatory fullscreen Input because of Input user did not fire changing
	// the fullscreen user property in publisherStartSpeaking event in VideoRoom Component
	@Input()
	set videoSizeBig(videoSizeBig: boolean) {
		this.checkVideoSizeBigIcon(videoSizeBig);
	}

	@Input()
	set user(user: UserModel) {
		this._user = user;
		this.nicknameFormControl = new FormControl(this._user.getNickname(), [Validators.maxLength(25), Validators.required]);
	}

	@ViewChild('nicknameInput')
	set nicknameInputElement(element: ElementRef) {
		setTimeout(() => {
			element?.nativeElement.focus();
		});
	}

	ngOnInit() {
		this.matcher = new NicknameMatcher();
	}

	ngOnDestroy() {
		this.cdkSrv.setSelector('body');
	}

	toggleVideoSize(resetAll?) {
		const element = this.documentService.getHTMLElementByClassName(this.streamComponent.element.nativeElement, LayoutType.ROOT_CLASS);
		if (!!resetAll) {
			this.documentService.removeAllBigElementClass();
			this.remoteUserService.resetUsersZoom();
			this.localUserService.resetUsersZoom();
		}

		this.documentService.toggleBigElementClass(element);

		if (!!this._user.getConnectionId()) {
			if (this.openViduWebRTCService.isMyOwnConnection(this._user.getConnectionId())) {
				this.localUserService.toggleZoom(this._user.getConnectionId());
			} else {
				this.remoteUserService.toggleUserZoom(this._user.getConnectionId());
			}
		}
		this.layoutService.update();
	}

	toggleFullscreen() {
		this.documentService.toggleFullscreen('container-' + this._user.getStreamManager().stream.streamId);
	}

	toggleVideoMenu(event) {
		if (this.menuTrigger.menuOpen) {
			this.menuTrigger.closeMenu();
			return;
		}
		this.cdkSrv.setSelector('#container-' + this._user.streamManager?.stream?.streamId);
		this.menuTrigger.openMenu();
	}

	toggleSound() {
		this.mutedSound = !this.mutedSound;
	}

	toggleNicknameForm() {
		if (this._user.isLocal()) {
			this.toggleNickname = !this.toggleNickname;
		}
	}

	eventKeyPress(event) {
		if (event && event.keyCode === 13 && this.nicknameFormControl.valid) {
			const nickname = this.nicknameFormControl.value;
			this.localUserService.updateUsersNickname(nickname);
			this.storageService.set(Storage.USER_NICKNAME, nickname);
			this.openViduWebRTCService.sendNicknameSignal();
			this.toggleNicknameForm();
		}
	}

	replaceScreenTrack() {
		this.openViduWebRTCService.replaceScreenTrack();
	}

	private checkVideoSizeBigIcon(videoSizeBig: boolean) {
		this.videoSizeIcon = videoSizeBig ? VideoSizeIcon.NORMAL : VideoSizeIcon.BIG;
	}

	private toggleFullscreenIcon() {
		this.fullscreenIcon = this.fullscreenIcon === VideoFullscreenIcon.BIG ? VideoFullscreenIcon.NORMAL : VideoFullscreenIcon.BIG;
	}
}
