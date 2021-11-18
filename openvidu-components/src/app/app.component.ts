import { Component, OnInit } from '@angular/core';
import { RestService } from './services/rest.service';
import { WebrtcService, LocalUserService, RemoteUserService } from 'openvidu-components-library';

@Component({
	selector: 'app-root',
	templateUrl: './app.component.html',
	styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {
	title = 'openvidu-components';
	toolbarColor = '';
	sessionId = 'prueba';
	tokens: { webcam: string; screen: string };

	joinSessionClicked: boolean = false;
	closeClicked: boolean = false;
	isSessionAlive: boolean = false;

	constructor(private restService: RestService) {}

	ngOnInit() {}

	async onJoinClicked() {
		this.tokens = {
			webcam: await this.restService.getToken(this.sessionId),
			screen: await this.restService.getToken(this.sessionId)
		};

		this.joinSessionClicked = true;
		this.isSessionAlive = true;
	}
	onCloseClicked() {
		this.closeClicked = true;
	}

	onMicClicked() {}

	onCamClicked() {}

	onScreenShareClicked() {}

	onSpeakerLayoutClicked() {}

	onLeaveSessionClicked() {
		this.isSessionAlive = false;
	}
}
