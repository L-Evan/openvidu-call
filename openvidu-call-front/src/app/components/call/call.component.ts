import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Params, Router } from '@angular/router';

import { RestService } from '../../services/rest.service';

import { WebrtcService, LocalUserService, RemoteUserService } from 'openvidu-components-library';

@Component({
	selector: 'app-call',
	templateUrl: './call.component.html',
	styleUrls: ['./call.component.css']
})
export class CallComponent implements OnInit {
	sessionId = '';
	tokens: { webcam: string; screen: string };

	joinSessionClicked: boolean = false;
	closeClicked: boolean = false;
	isSessionAlive: boolean = false;

	constructor(private restService: RestService, private router: Router, private route: ActivatedRoute) {}

	ngOnInit() {
		this.route.params.subscribe((params: Params) => {
			this.sessionId = params.roomName;
		});
	}

	async onJoinClicked() {
    console.log("session id =>", this.sessionId);
    this.joinSessionClicked = true;

		this.tokens = {
			webcam: await this.restService.getToken(this.sessionId),
			screen: await this.restService.getToken(this.sessionId)
		};

		this.isSessionAlive = true;
	}
	onCloseClicked() {
		this.closeClicked = true;
		this.router.navigate([`/`]);
	}

	onMicClicked() {}

	onCamClicked() {}

	onScreenShareClicked() {}

	onSpeakerLayoutClicked() {}

	onLeaveSessionClicked() {
		this.isSessionAlive = false;
	}
}
