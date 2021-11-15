import { Component, EventEmitter, HostListener, Input, OnInit, Output, ViewChild } from '@angular/core';
import { MatSidenav } from '@angular/material/sidenav';
import { Subscription } from 'rxjs';
import {
	Publisher,
	Subscriber,
	Session,
	StreamEvent,
	StreamPropertyChangedEvent,
	SessionDisconnectedEvent,
	ConnectionEvent
} from 'openvidu-browser';

import { UserModel } from '../../models/user.model';
import { VideoType } from '../../models/video-type.model';
import { ILogger } from '../../models/logger.model';
import { UserName } from '../../models/username.model';

import { RemoteUserService } from '../../services/remote-user/remote-user.service';
import { ChatService } from '../../services/chat/chat.service';
import { LocalUserService } from '../../services/local-user/local-user.service';
import { LoggerService } from '../../services/logger/logger.service';
import { UtilsService } from '../../services/utils/utils.service';
import { WebrtcService } from '../../services/webrtc/webrtc.service';
import { TokenService } from '../../services/token/token.service';
import { PlatformService } from '../../services/platform/platform.service';
import { LayoutService } from '../../services/layout/layout.service';
import { ActionService } from '../../services/action/action.service';


@Component({
	selector: 'ov-room',
	templateUrl: './room.component.html',
	styleUrls: ['./room.component.css']
})
export class RoomComponent implements OnInit {
	@Input() tokens: {webcam:string, screen: string};
	@Output() _session = new EventEmitter<any>();
	@Output() _publisher = new EventEmitter<any>();
	@Output() _error = new EventEmitter<any>();

	@ViewChild('sidenav') chatSidenav: MatSidenav;

	compact = false;
	sidenavMode: 'side' | 'over' = 'side';
	session: Session;
	sessionScreen: Session;
	localUsers: UserModel[] = [];
	remoteUsers: UserModel[] = [];
	participantsNameList: UserName[] = [];
	isConnectionLost: boolean;
	private log: ILogger;
	private oVUsersSubscription: Subscription;
	private remoteUsersSubscription: Subscription;
	private chatSubscription: Subscription;
	private remoteUserNameSubscription: Subscription;

	constructor(
		private actionService: ActionService,
		private utilsSrv: UtilsService,
		private remoteUsersService: RemoteUserService,
		private openViduWebRTCService: WebrtcService,
		private localUsersService: LocalUserService,
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
		// this.localUsersService.initialize();
		// this.openViduWebRTCService.initialize();

		this.subscribeToLocalUsers();
		this.subscribeToRemoteUsers();

		this.tokenService.setWebcamToken(this.tokens.webcam);
		this.tokenService.setScreenToken(this.tokens.screen);

		setTimeout(() => {
			this.joinToSession();
		}, 50);

	}

	ngOnDestroy() {
		// Reconnecting session is received in Firefox
		// To avoid 'Connection lost' message uses session.off()
		this.session?.off('reconnecting');
		this.remoteUsersService.clear();
		this.oVLayout.clear();
		this.localUsersService.clear();
		this.session = null;
		this.sessionScreen = null;
		this.localUsers = [];
		this.remoteUsers = [];
		if (this.oVUsersSubscription) {
			this.oVUsersSubscription.unsubscribe();
		}
		if (this.remoteUsersSubscription) {
			this.remoteUsersSubscription.unsubscribe();
		}
		if (this.chatSubscription) {
			this.chatSubscription.unsubscribe();
		}
		if (this.remoteUserNameSubscription) {
			this.remoteUserNameSubscription.unsubscribe();
		}
	}

	async joinToSession() {
		this.openViduWebRTCService.initSessions();
		this.session = this.openViduWebRTCService.getWebcamSession();
		this._session.emit(this.session);
		this.sessionScreen = this.openViduWebRTCService.getScreenSession();
		this.subscribeToConnectionCreatedAndDestroyed();
		this.subscribeToStreamCreated();
		this.subscribeToStreamDestroyed();
		this.subscribeToStreamPropertyChange();
		this.subscribeToNicknameChanged();
		this.chatService.subscribeToChat();
		// this.subscribeToChatComponent();
		this.subscribeToReconnection();
		await this.connectToSession();
		// Workaround, firefox does not have audio when publisher join with muted camera
		if (this.platformService.isFirefox() && !this.localUsersService.hasWebcamVideoActive()) {
			this.openViduWebRTCService.publishWebcamVideo(true);
			this.openViduWebRTCService.publishWebcamVideo(false);
		}
	}

	leaveSession() {
		this.log.d('Leaving session...');
		this.openViduWebRTCService.disconnect();
	}


	//TODO Refactor connection methods move them to a service
	private async connectToSession(): Promise<void> {

		if (this.localUsersService.areBothConnected()) {
			await this.connectWebcamSession();
			await this.connectScreenSession();
			await this.openViduWebRTCService.publishWebcamPublisher();
			await this.openViduWebRTCService.publishScreenPublisher();
		} else if (this.localUsersService.isOnlyScreenConnected()) {
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

			const nickname: string = this.utilsSrv.getNicknameFromConnectionData(event.connection.data);
			this.remoteUsersService.addUserName(event);

			// Adding participant when connection is created
			if (!nickname?.includes('_' + VideoType.SCREEN)) {
				this.remoteUsersService.add(event, null);
				this.openViduWebRTCService.sendNicknameSignal(event.connection);
			}
		});

		this.session.on('connectionDestroyed', (event: ConnectionEvent) => {
			if (this.openViduWebRTCService.isMyOwnConnection(event.connection.connectionId)) {
				return;
			}
			this.remoteUsersService.deleteUserName(event);
			const nickname: string = this.utilsSrv.getNicknameFromConnectionData(event.connection.data);
			// Deleting participant when connection is destroyed
			if (!nickname?.includes('_' + VideoType.SCREEN)) {
				this.remoteUsersService.removeUserByConnectionId(event.connection.connectionId);
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
			this.remoteUsersService.add(event, subscriber);
			// this.oVSessionService.sendNicknameSignal(event.stream.connection);
		});
	}

	private subscribeToStreamDestroyed() {
		this.session.on('streamDestroyed', (event: StreamEvent) => {
			const connectionId = event.stream.connection.connectionId;
			this.remoteUsersService.removeUserByConnectionId(connectionId);
			// event.preventDefault();
		});
	}

	// Emit publisher to webcomponent
	emitPublisher(publisher: Publisher) {
		this._publisher.emit(publisher);
	}

	private subscribeToStreamPropertyChange() {
		this.session.on('streamPropertyChanged', (event: StreamPropertyChangedEvent) => {
			const connectionId = event.stream.connection.connectionId;
			if (this.openViduWebRTCService.isMyOwnConnection(connectionId)) {
				return;
			}
			if (event.changedProperty === 'videoActive') {
				this.remoteUsersService.updateUsers();
			}
		});
	}

	private subscribeToNicknameChanged() {
		this.session.on('signal:nicknameChanged', (event: any) => {
			const connectionId = event.from.connectionId;
			if (this.openViduWebRTCService.isMyOwnConnection(connectionId)) {
				return;
			}
			const nickname = this.utilsSrv.getNicknameFromConnectionData(event.data);
			this.remoteUsersService.updateNickname(connectionId, nickname);
		});
	}

	private subscribeToReconnection() {
		this.session.on('reconnecting', () => {
			this.log.w('Connection lost: Reconnecting');
			this.isConnectionLost = true;
			this.actionService.openDialog('Connection Problem', 'Oops! Trying to reconnect to the session ...', true);
		});
		this.session.on('reconnected', () => {
			this.log.w('Connection lost: Reconnected');
			this.isConnectionLost = false;
			this.actionService.closeDialog();
		});
		this.session.on('sessionDisconnected', (event: SessionDisconnectedEvent) => {
			if (event.reason === 'networkDisconnect') {
				this.actionService.closeDialog();
				this.leaveSession();
			}
		});
	}

	private subscribeToLocalUsers() {
		this.oVUsersSubscription = this.localUsersService.OVUsers.subscribe((users: UserModel[]) => {
			this.localUsers = users;
			this.oVLayout.update();
		});
	}

	private subscribeToRemoteUsers() {
		this.remoteUsersSubscription = this.remoteUsersService.remoteUsers.subscribe((users: UserModel[]) => {
			this.remoteUsers = [...users];
			this.oVLayout.update();
		});

		this.remoteUserNameSubscription = this.remoteUsersService.remoteUserNameList.subscribe((names: UserName[]) => {
			this.participantsNameList = [...names];
		});
	}
}
