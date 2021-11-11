import { Injectable } from '@angular/core';
import { ExternalConfigModel } from '../../models/external-config.model';
import { ILogger } from '../../models/logger.model';
import { SettingsModel } from '../../models/settings.model';

import { LoggerService } from '../logger/logger.service';
import { RestService } from '../rest/rest.service';

@Injectable({
	providedIn: 'root'
})
export class TokenService {
	private webcamToken = '';
	private screenToken = '';
	private sessionId = '';
	private ovSettings: SettingsModel;
	private log: ILogger;

	constructor(private loggerSrv: LoggerService, private restSrv: RestService) {
		this.log = this.loggerSrv.get('TokenService');
	}

	initialize(ovSettings: SettingsModel) {
		this.ovSettings = ovSettings;
	}

	setSessionId(sessionId: string) {
		this.sessionId = sessionId;
	}

	getSessionId(): string {
		return this.sessionId;
	}

	async initTokens(externalConfig: ExternalConfigModel) {
		// WebComponent or Angular library
		if (!!externalConfig && externalConfig.hasTokens()) {
			this.log.d('Received external tokens from ' + externalConfig.getComponentName());
			this.webcamToken = externalConfig.getWebcamToken();
			// Only connect screen if screen sharing feature is available
			this.screenToken = this.ovSettings?.hasScreenSharing() ? externalConfig.getScreenToken() : undefined;
			return;
		}
		this.log.d('No external tokens received. Generating token...');
		await this.generateWebcamToken(this.sessionId, externalConfig?.getOvServerUrl(), externalConfig?.getOvSecret());
		// TODO: create screenToken only when user initialize the screen
		if (this.ovSettings?.hasScreenSharing()) {
			await this.generateScreenToken(this.sessionId, externalConfig?.getOvServerUrl(), externalConfig?.getOvSecret());
		}
	}

	getWebcamToken(): string {
		return this.webcamToken;
	}

	getScreenToken(): string {
		return this.screenToken;
	}

	private async generateWebcamToken(sessionId: string, ovUrl: string, ovSecret: string) {
		this.log.d('Generating webcam token...');
		this.webcamToken = await this.restSrv.getToken(sessionId, ovUrl, ovSecret);
	}

	private async generateScreenToken(sessionId: string, ovUrl: string, ovSecret: string) {
		this.log.d('Generating screen token...');
		this.screenToken = await this.restSrv.getToken(sessionId, ovUrl, ovSecret);
	}
}
