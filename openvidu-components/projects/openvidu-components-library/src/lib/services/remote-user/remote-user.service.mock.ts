import { Injectable } from '@angular/core';
import { StreamEvent, Subscriber } from 'openvidu-browser';
import { Observable, BehaviorSubject } from 'rxjs';
import { ILogger } from '../../models/logger.model';
import { UserModel } from '../../models/user.model';
import { UserName } from '../../models/username.model';

@Injectable({
	providedIn: 'root'
})
export class RemoteUserServiceMock {

	remoteUsers: Observable<UserModel[]>;
	remoteUserNameList: Observable<UserName[]>;
	private _remoteUsers = <BehaviorSubject<UserModel[]>>new BehaviorSubject([]);
	private _remoteUserNameList = <BehaviorSubject<UserName[]>>new BehaviorSubject([]);

	private users: UserModel[] = [];

	private log: ILogger;
	constructor() {
		this.remoteUsers = this._remoteUsers.asObservable();
		this.remoteUserNameList = this._remoteUserNameList.asObservable();
	}

	updateUsers() {}

	add(event: StreamEvent, subscriber: Subscriber) {}

	removeUserByConnectionId(connectionId: string) {}

	someoneIsSharingScreen(): boolean {
		return false;
	}

	toggleUserZoom(connectionId: string) {}

	resetUsersZoom() {}

	setUserZoom(connectionId: string, zoom: boolean) {}

	getRemoteUserByConnectionId(connectionId: string): UserModel {
		return null;
	}

	updateNickname(connectionId: any, nickname: any) {}

	clear() {}

	getUserAvatar(connectionId: string): string {
		return 'avatar';
	}
}
