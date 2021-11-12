import { Injectable } from '@angular/core';
import { MatSidenav } from '@angular/material/sidenav';
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


@Injectable({
	providedIn: 'root'
})
export class ChatService {
	messagesObs: Observable<ChatMessage[]>;
	messagesUnreadObs: Observable<number>;
	toggleChatObs: Observable<boolean>;

	private chatComponent: MatSidenav;

	private _messageList = <BehaviorSubject<ChatMessage[]>>new BehaviorSubject([]);
	private _toggleChat = <BehaviorSubject<boolean>>new BehaviorSubject(false);

	private messageList: ChatMessage[] = [];
	private chatOpened: boolean;
	private messagesUnread = 0;
	private log: ILogger;

	private _messagesUnread = <BehaviorSubject<number>>new BehaviorSubject(0);

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
		this.messagesUnreadObs = this._messagesUnread.asObservable();
	}

	setChatComponent(chatSidenav: MatSidenav) {
		this.chatComponent = chatSidenav;
	}

	subscribeToChat() {
		const session = this.openViduWebRTCService.getWebcamSession();
		session.on('signal:chat', (event: any) => {
			const connectionId = event.from.connectionId;
			const data = JSON.parse(event.data);
			const isMyOwnConnection = this.openViduWebRTCService.isMyOwnConnection(connectionId);
			this.messageList.push({
				isLocal: isMyOwnConnection,
				nickname: data.nickname,
				message: data.message,
				userAvatar: isMyOwnConnection ? this.localUsersService.getAvatar() : this.remoteUsersService.getUserAvatar(connectionId)
			});
			if (!this.isChatOpened()) {
				this.addMessageUnread();
        const notificationOptions: INotificationOptions = {
          message: `${data.nickname.toUpperCase()} sent a message`,
          cssClassName: 'messageSnackbar',
          buttonActionText: 'READ'
        }
				this.actionService.launchNotification(data.nickname.toUpperCase(), this.toggleChat.bind(this));
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
			const sessionAvailable = this.openViduWebRTCService.getSessionOfUserConnected();
			sessionAvailable.signal({
				data: JSON.stringify(data),
				type: 'chat'
			});
		}
	}

	toggleChat() {
		this.log.d('Toggling chat');
		this.chatComponent.toggle().then(() => {
			this.chatOpened = this.chatComponent.opened;
			this._toggleChat.next(this.chatOpened);
			if (this.chatOpened) {
				this.resetUnreadMessages();
			}
		});
	}

	resetUnreadMessages() {
		this.messagesUnread = 0;
		this._messagesUnread.next(this.messagesUnread);
	}

	private isChatOpened(): boolean {
		return this.chatOpened;
	}

	private addMessageUnread() {
		this.messagesUnread++;
		this._messagesUnread.next(this.messagesUnread);
	}
}
