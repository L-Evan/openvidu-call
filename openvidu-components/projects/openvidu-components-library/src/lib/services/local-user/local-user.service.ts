import { Injectable } from '@angular/core';
import { Publisher } from 'openvidu-browser';
import { BehaviorSubject, Observable } from 'rxjs';
import { ILogger } from '../../models/logger.model';
import { UserModel } from '../../models/user.model';
import { LoggerService } from '../logger/logger.service';

@Injectable({
	providedIn: 'root'
})
export class LocalUserService {
	OVUsers: Observable<UserModel[]>;
	screenShareState: Observable<boolean>;
	webcamVideoActive: Observable<boolean>;
	webcamAudioActive: Observable<boolean>;
	private _OVUsers = <BehaviorSubject<UserModel[]>>new BehaviorSubject([]);
	private _screenShareState = <BehaviorSubject<boolean>>new BehaviorSubject(false);
	private _webcamVideoActive = <BehaviorSubject<boolean>>new BehaviorSubject(true);
	private _webcamAudioActive = <BehaviorSubject<boolean>>new BehaviorSubject(true);

	private webcamUser: UserModel = null;
	private screenUser: UserModel = null;
	private log: ILogger;

	constructor(private loggerSrv: LoggerService) {
		this.log = this.loggerSrv.get('LocalUserService');
	}

	initialize() {
		this.OVUsers = this._OVUsers.asObservable();
		this.screenShareState = this._screenShareState.asObservable();
		this.webcamVideoActive = this._webcamVideoActive.asObservable();
		this.webcamAudioActive = this._webcamAudioActive.asObservable();
		this.webcamUser = new UserModel();
		// Used when the streamManager is null (users without devices)
		this.webcamUser.setLocal(true);
		this._OVUsers.next([this.webcamUser]);
	}

	getWebcamPublisher(): Publisher {
		return <Publisher>this.webcamUser?.getStreamManager();
	}

	setWebcamPublisher(publisher: Publisher) {
		this.webcamUser.setStreamManager(publisher);
	}

	getScreenPublisher(): Publisher {
		return <Publisher>this.screenUser?.getStreamManager();
	}

	setScreenPublisher(publisher: Publisher) {
		this.screenUser.setStreamManager(publisher);
	}

	enableWebcamUser() {
		this._OVUsers.next([this.webcamUser, this.screenUser]);
	}

	disableWebcamUser() {
		// this.destryowebcamUser();
		this._OVUsers.next([this.screenUser]);
	}

	enableScreenUser(screenPublisher: Publisher) {
		this.log.d('Enabling screen publisher');

		const connectionId = screenPublisher?.session?.connection?.connectionId;

		this.screenUser = new UserModel(connectionId, screenPublisher, this.getScreenUserName());
		this.screenUser.setAvatar(this.webcamUser.getAvatar());
		this._screenShareState.next(true);

		if (this.isWebCamEnabled()) {
			this._OVUsers.next([this.webcamUser, this.screenUser]);
			return;
		}
		this._OVUsers.next([this.screenUser]);
	}

	disableScreenUser() {
		// this.destryoScreenUser();
		this._OVUsers.next([this.webcamUser]);
		this._screenShareState.next(false);
	}

	updateUsersStatus() {
		this._webcamVideoActive.next(this.webcamUser.isVideoActive());
		if (this.isWebCamEnabled()) {
			this._webcamAudioActive.next(this.webcamUser.isAudioActive());
		} else {
			this._webcamAudioActive.next(this.hasScreenAudioActive());

		}
	}

	clear() {
		this.screenUser = null;
		this.webcamUser = new UserModel();
		// this._OVUsers.next([this.webcamUser]);
		this.disableScreenUser();
	}

	isWebCamEnabled(): boolean {
		return this._OVUsers.getValue()[0].isCamera();
	}

	isOnlyScreenConnected(): boolean {
		return this._OVUsers.getValue()[0].isScreen();
	}

	hasWebcamVideoActive(): boolean {
		return this.webcamUser.isVideoActive();
	}

	hasWebcamAudioActive(): boolean {
		return this.webcamUser?.isAudioActive();
	}

	hasScreenAudioActive(): boolean {
		return this.screenUser?.isAudioActive();
	}

	areBothConnected(): boolean {
		return this._OVUsers.getValue().length === 2;
	}

	isOnlyWebcamConnected(): boolean {
		return this.isWebCamEnabled() && !this.areBothConnected();
	}

	isScreenShareEnabled(): boolean {
		return this.areBothConnected() || this.isOnlyScreenConnected();
	}

	setAvatar(avatar: string) {
		this.webcamUser?.setAvatar(avatar);
		this.screenUser?.setAvatar(avatar);
	}

	updateUsersNickname(nickname: string) {
		this.webcamUser.setNickname(nickname);
		this.screenUser?.setNickname(this.getScreenUserName());
	}

	getAvatar(): string {
		return this.webcamUser.getAvatar();
	}

	getWebcamUserName(): string {
		return this.webcamUser.getNickname();
	}

	getScreenUserName() {
		return this.getWebcamUserName() + '_SCREEN';
	}

	resetUsersZoom() {
		this.webcamUser?.setVideoSizeBig(false);
		this.screenUser?.setVideoSizeBig(false);
	}

	toggleZoom(connectionId: string) {
		if (this.webcamUser.getConnectionId() === connectionId) {
			this.webcamUser.setVideoSizeBig(!this.webcamUser.isVideoSizeBig());
			return;
		}
		this.screenUser.setVideoSizeBig(!this.screenUser.isVideoSizeBig());
	}
}
