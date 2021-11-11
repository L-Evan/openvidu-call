import { Injectable } from '@angular/core';

import { LoggerService } from '../../services/logger/logger.service';
import { LocalUserService } from '../../services/local-user/local-user.service';

import { ILogger } from '../../models/logger.model';
import { AvatarType } from '../../models/chat.model';

@Injectable({
	providedIn: 'root'
})
export class AvatarService {
	private openviduAvatar = 'assets/images/openvidu_globe.png';
	private capturedAvatar = '';
	private log: ILogger;

	constructor(private localUsersService: LocalUserService, private loggerSrv: LoggerService) {
		this.log = this.loggerSrv.get('ChatService');
	}

	setCaputedAvatar(avatar: string) {
		this.capturedAvatar = avatar;
	}

	setFinalAvatar(type: AvatarType) {
		if (type === AvatarType.CAPTURED) {
			this.localUsersService.setAvatar(this.capturedAvatar);
			return;
		}

		this.localUsersService.setAvatar(this.openviduAvatar);
	}

	getOpenViduAvatar(): string {
		return this.openviduAvatar;
	}
	getCapturedAvatar(): string {
		return this.capturedAvatar;
	}

	createCapture(): string {
		this.log.d('Capturing avatar ...');
		const avatar = document.createElement('canvas');
		const video: HTMLVideoElement = this.localUsersService.getWebcamPublisher().videos[0].video;

		avatar.className = 'user-img';
		avatar.width = 100;
		avatar.height = 100;

		if (!!video) {
			const avatarContext = avatar.getContext('2d');
			avatarContext.drawImage(video, 200, 120, 285, 285, 0, 0, 100, 100);
			this.capturedAvatar = avatar.toDataURL();
		}
		return this.capturedAvatar;
	}

	getAvatarFromConnectionData(data: string): string {
		let avatar: string;
		try {
			avatar = JSON.parse(data).avatar;
		} catch (error) {
			avatar = this.getOpenViduAvatar();
		}
		return avatar;
	}

	clear() {
		this.capturedAvatar = '';
	}
}
