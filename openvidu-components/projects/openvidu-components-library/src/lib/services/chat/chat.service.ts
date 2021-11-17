import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/internal/Observable';
import { BehaviorSubject } from 'rxjs/internal/BehaviorSubject';

import { ILogger } from '../../models/logger.model';
import { ChatMessage } from '../../models/chat.model';
import { INotificationOptions } from '../../models/notification-options.model';

import { ActionService } from '../action/action.service';
import { WebrtcService } from '../webrtc/webrtc.service';
import { LocalUserService } from '../local-user/local-user.service';
import { LoggerService } from '../logger/logger.service';
import { RemoteUserService } from '../remote-user/remote-user.service';
import { Signal } from '../../models/signal.model';

@Injectable({
	providedIn: 'root'
})
export class ChatService {
	messagesObs: Observable<ChatMessage[]>;
	toggleChatObs: Observable<boolean>;

	private _messageList = <BehaviorSubject<ChatMessage[]>>new BehaviorSubject([]);
	private _toggleChat = <BehaviorSubject<boolean>>new BehaviorSubject(false);

	private messageList: ChatMessage[] = [];
	private isChatOpened: boolean = false;
	private log: ILogger;
	constructor(
		private loggerSrv: LoggerService,
		private openViduWebRTCService: WebrtcService,
		private localUsersService: LocalUserService,
		private remoteUsersService: RemoteUserService,
		private actionService: ActionService
	) {
		this.log = this.loggerSrv.get('ChatService');
		this.messagesObs = this._messageList.asObservable();
		this.toggleChatObs = this._toggleChat.asObservable();
	}

	subscribeToChat() {
		const session = this.openViduWebRTCService.getWebcamSession();
		session.on(`signal:${Signal.CHAT}`, (event: any) => {
			const connectionId = event.from.connectionId;
			const data = JSON.parse(event.data);
			const isMyOwnConnection = this.openViduWebRTCService.isMyOwnConnection(connectionId);
			this.messageList.push({
				isLocal: isMyOwnConnection,
				nickname: data.nickname,
				message: data.message,
				userAvatar: isMyOwnConnection ? this.localUsersService.getAvatar() : this.remoteUsersService.getUserAvatar(connectionId)
			});
			if (!this.isChatOpened) {
				const notificationOptions: INotificationOptions = {
					message: `${data.nickname.toUpperCase()} sent a message`,
					cssClassName: 'messageSnackbar',
					buttonActionText: 'READ'
				};
				this.actionService.launchNotification(notificationOptions, this.toggleChat.bind(this));
			}
			this._messageList.next(this.messageList);
		});
	}

	sendMessage(message: string) {
		message = message.replace(/ +(?= )/g, '');
		if (message !== '' && message !== ' ') {
			const data = {
				message: message,
				nickname: this.localUsersService.getWebcamUserName()
			};

			this.openViduWebRTCService.sendSignal(Signal.CHAT, undefined, data);
		}
	}

	toggleChat() {
		this.log.d('Toggling chat');
		this.isChatOpened = !this.isChatOpened;
		this._toggleChat.next(this.isChatOpened);
	}
}
