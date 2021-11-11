import { Component, OnInit } from '@angular/core';
import { ExternalConfigModel, WebrtcService, LocalUserService } from 'openvidu-components-library';

@Component({
	selector: 'app-root',
	templateUrl: './app.component.html',
	styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {
	title = 'openvidu-components';
	toolbarColor = '';
  angularLibrary: ExternalConfigModel;


	constructor(
		private openViduWebRTCService: WebrtcService,
		private localUsersService: LocalUserService, ) {}

	ngOnInit() {

		//TODO:
		this.angularLibrary = new ExternalConfigModel();
		this.angularLibrary.setOvSettings(null);
		this.angularLibrary.setSessionName('prueba');
		this.angularLibrary.setOvServerUrl('this.openviduServerUrl');
		this.angularLibrary.setOvSecret('MY_SECRET');
		this.angularLibrary.setTheme('DARK');
		this.angularLibrary.setNickname('tester');
		// this.angularLibrary.setTokens();
		// if (this.angularLibrary.canJoinToSession()) {
		// 	this.display = true;
		// 	return;
		// }

		this.localUsersService.initialize();
		this.openViduWebRTCService.initialize();
	}

	clickButton() {}
}
