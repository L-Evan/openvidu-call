import { Injectable } from '@angular/core';
import { ILogger } from '../../models/logger.model';
import { LoggerService } from '../logger/logger.service';

@Injectable({
	providedIn: 'root'
})
export class TokenService {
	private webcamToken = '';
	private screenToken = '';
	private sessionId = '';
	private log: ILogger;

	constructor(private loggerSrv: LoggerService) {
		this.log = this.loggerSrv.get('TokenService');
	}

	getSessionId(): string {
		return this.sessionId;
	}

	setWebcamToken(token: string){
		this.webcamToken = token;
	}

	setScreenToken(token: string){
		this.screenToken = token;
	}

	// async initTokens(externalConfig: ExternalConfigModel) {
	// 	this.log.d('Generating token...');
	// 	await this.generateWebcamToken(this.sessionId, externalConfig?.getOvServerUrl(), externalConfig?.getOvSecret());
	// 	// TODO: create screenToken only when user initialize the screen
	// 	if (this.ovSettings?.hasScreenSharing()) {
	// 		await this.generateScreenToken(this.sessionId, externalConfig?.getOvServerUrl(), externalConfig?.getOvSecret());
	// 	}
	// }

	getWebcamToken(): string {
		return this.webcamToken;
	}

	getScreenToken(): string {
		return this.screenToken;
	}

	// private async generateWebcamToken(sessionId: string, ovUrl: string, ovSecret: string) {
	// 	this.log.d('Generating webcam token...');
	// 	this.webcamToken = await this.restSrv.getToken(sessionId, ovUrl, ovSecret);
	// }

	// private async generateScreenToken(sessionId: string, ovUrl: string, ovSecret: string) {
	// 	this.log.d('Generating screen token...');
	// 	this.screenToken = await this.restSrv.getToken(sessionId, ovUrl, ovSecret);
	// }
}
