import { Component, EventEmitter, HostListener, Input, OnInit, Output } from '@angular/core';
import { Subscription } from 'rxjs';
import { Subscriber, Session, StreamEvent, StreamPropertyChangedEvent, SessionDisconnectedEvent, ConnectionEvent } from 'openvidu-browser';

import { VideoType } from '../../models/video-type.model';
import { ILogger } from '../../models/logger.model';
import { UserName } from '../../models/username.model';

import { RemoteUserService } from '../../services/remote-user/remote-user.service';
import { ChatService } from '../../services/chat/chat.service';
import { LocalUserService } from '../../services/local-user/local-user.service';
import { LoggerService } from '../../services/logger/logger.service';
import { WebrtcService } from '../../services/webrtc/webrtc.service';
import { TokenService } from '../../services/token/token.service';
import { PlatformService } from '../../services/platform/platform.service';
import { LayoutService } from '../../services/layout/layout.service';
import { ActionService } from '../../services/action/action.service';
import { Signal } from '../../models/signal.model';

@Component({
	selector: 'ov-room',
	templateUrl: './room.component.html',
	styleUrls: ['./room.component.css']
})
export class RoomComponent implements OnInit {
	@Input() tokens: { webcam: string; screen: string };
	@Output() _session = new EventEmitter<any>();
	@Output() _publisher = new EventEmitter<any>();
	@Output() _error = new EventEmitter<any>();

	session: Session;
	sessionScreen: Session;
	participantsNameList: UserName[] = [];
	private log: ILogger;
	private remoteUserNameSubscription: Subscription;

	constructor(
		private actionService: ActionService,
		private remoteUserService: RemoteUserService,
		private openViduWebRTCService: WebrtcService,
		private localUserService: LocalUserService,
		private loggerSrv: LoggerService,
		private chatService: ChatService,
		private oVLayout: LayoutService,
		private tokenService: TokenService,
		private platformService: PlatformService
	) {
		this.log = this.loggerSrv.get('RoomComponent');
	}

	@HostListener('window:beforeunload')
	beforeunloadHandler() {
		this.leaveSession();
	}

	async ngOnInit() {
		this.session = this.openViduWebRTCService.getWebcamSession();
		this.sessionScreen = this.openViduWebRTCService.getScreenSession();
		this.subscribeToConnectionCreatedAndDestroyed();
		this.subscribeToStreamCreated();
		this.subscribeToStreamDestroyed();
		this.subscribeToStreamPropertyChange();
		this.subscribeToNicknameChanged();
		this.chatService.subscribeToChat();
		this.subscribeToReconnection();

		this.tokenService.setWebcamToken(this.tokens.webcam);
		this.tokenService.setScreenToken(this.tokens.screen);

		await this.connectToSession();
		// Workaround, firefox does not have audio when publisher join with muted camera
		if (this.platformService.isFirefox() && !this.localUserService.hasWebcamVideoActive()) {
			this.openViduWebRTCService.publishWebcamVideo(true);
			this.openViduWebRTCService.publishWebcamVideo(false);
		}

		this._session.emit(this.session);
	}

	ngOnDestroy() {
		// Reconnecting session is received in Firefox
		// To avoid 'Connection lost' message uses session.off()
		this.session?.off('reconnecting');
		this.remoteUserService.clear();
		this.oVLayout.clear();
		this.localUserService.clear();
		this.session = null;
		this.sessionScreen = null;

		if (this.remoteUserNameSubscription) {
			this.remoteUserNameSubscription.unsubscribe();
		}
	}

	leaveSession() {
		this.log.d('Leaving session...');
		this.openViduWebRTCService.disconnect();
	}

	//TODO Refactor connection methods move them to a service
	private async connectToSession(): Promise<void> {
		if (this.localUserService.areBothConnected()) {
			await this.connectWebcamSession();
			await this.connectScreenSession();
			await this.openViduWebRTCService.publishWebcamPublisher();
			await this.openViduWebRTCService.publishScreenPublisher();
		} else if (this.localUserService.isOnlyScreenConnected()) {
			await this.connectScreenSession();
			await this.openViduWebRTCService.publishScreenPublisher();
		} else {
			await this.connectWebcamSession();
			await this.openViduWebRTCService.publishWebcamPublisher();
		}

		this.oVLayout.update();
	}

	//TODO Refactor connection methods move them to a service
	private async connectScreenSession() {
		try {
			await this.openViduWebRTCService.connectScreenSession(this.tokenService.getScreenToken());
		} catch (error) {
			this._error.emit({ error: error.error, messgae: error.message, code: error.code, status: error.status });
			this.log.e('There was an error connecting to the session:', error.code, error.message);
			this.actionService.openDialog('There was an error connecting to the session:', error?.error || error?.message);
		}
	}

	//TODO Refactor connection methods move them to a service
	private async connectWebcamSession() {
		try {
			await this.openViduWebRTCService.connectWebcamSession(this.tokenService.getWebcamToken());
		} catch (error) {
			this._error.emit({ error: error.error, messgae: error.message, code: error.code, status: error.status });
			this.log.e('There was an error connecting to the session:', error.code, error.message);
			this.actionService.openDialog('There was an error connecting to the session:', error?.error || error?.message);
		}
	}

	private subscribeToConnectionCreatedAndDestroyed() {
		this.session.on('connectionCreated', (event: ConnectionEvent) => {
			if (this.openViduWebRTCService.isMyOwnConnection(event.connection.connectionId)) {
				return;
			}

			const nickname: string = this.remoteUserService.getNicknameFromConnectionData(event.connection.data);
			this.remoteUserService.addUserName(event);

			// Adding participant when connection is created
			if (!nickname?.includes('_' + VideoType.SCREEN)) {
				this.remoteUserService.add(event, null);

				//Sending nicnkanme signal to new participants
				if (this.openViduWebRTCService.needSendNicknameSignal()) {
					const data = { clientData: this.localUserService.getWebcamUserName() };
					this.openViduWebRTCService.sendSignal(Signal.NICKNAME_CHANGED, event.connection, data);
				}
			}
		});

		this.session.on('connectionDestroyed', (event: ConnectionEvent) => {
			if (this.openViduWebRTCService.isMyOwnConnection(event.connection.connectionId)) {
				return;
			}
			this.remoteUserService.deleteUserName(event);
			const nickname: string = this.remoteUserService.getNicknameFromConnectionData(event.connection.data);
			// Deleting participant when connection is destroyed
			if (!nickname?.includes('_' + VideoType.SCREEN)) {
				this.remoteUserService.removeUserByConnectionId(event.connection.connectionId);
			}
		});
	}

	private subscribeToStreamCreated() {
		this.session.on('streamCreated', (event: StreamEvent) => {
			const connectionId = event.stream.connection.connectionId;

			if (this.openViduWebRTCService.isMyOwnConnection(connectionId)) {
				return;
			}

			const subscriber: Subscriber = this.session.subscribe(event.stream, undefined);
			this.remoteUserService.add(event, subscriber);
			// this.oVSessionService.sendNicknameSignal(event.stream.connection);
		});
	}

	private subscribeToStreamDestroyed() {
		this.session.on('streamDestroyed', (event: StreamEvent) => {
			const connectionId = event.stream.connection.connectionId;
			this.remoteUserService.removeUserByConnectionId(connectionId);
			// event.preventDefault();
		});
	}

	private subscribeToStreamPropertyChange() {
		this.session.on('streamPropertyChanged', (event: StreamPropertyChangedEvent) => {
			const connectionId = event.stream.connection.connectionId;
			if (this.openViduWebRTCService.isMyOwnConnection(connectionId)) {
				return;
			}
			if (event.changedProperty === 'videoActive') {
				this.remoteUserService.updateUsers();
			}
		});
	}

	private subscribeToNicknameChanged() {
		this.session.on('signal:nicknameChanged', (event: any) => {
			const connectionId = event.from.connectionId;
			if (this.openViduWebRTCService.isMyOwnConnection(connectionId)) {
				return;
			}
			this.remoteUserService.updateNickname(connectionId, event.data);
		});
	}

	private subscribeToReconnection() {
		this.session.on('reconnecting', () => {
			this.log.w('Connection lost: Reconnecting');
			this.actionService.openDialog('Connection Problem', 'Oops! Trying to reconnect to the session ...', false);
		});
		this.session.on('reconnected', () => {
			this.log.w('Connection lost: Reconnected');
			this.actionService.closeDialog();
		});
		this.session.on('sessionDisconnected', (event: SessionDisconnectedEvent) => {
			if (event.reason === 'networkDisconnect') {
				this.actionService.closeDialog();
				this.leaveSession();
			}
		});
	}
}
