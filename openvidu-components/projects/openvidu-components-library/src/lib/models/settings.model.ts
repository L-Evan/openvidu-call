export interface ISettings {
	chat: boolean;
	autopublish: boolean;
	toolbar: boolean;
	footer: boolean;
	toolbarButtons: {
		audio: boolean;
		video: boolean;
		screenShare: boolean;
		fullscreen: boolean;
		layoutSpeaking: boolean;
		exit: boolean;
	};
}


export class SettingsModel {

	protected ovSettings: ISettings;

	constructor() {
		this.ovSettings = {
			chat: true,
			autopublish: false,
			toolbar: true,
			footer: true,
			toolbarButtons: {
				video: true,
				audio: true,
				fullscreen: true,
				screenShare: true,
				layoutSpeaking: true,
				exit: true
			}
		};
	}

	public set(ovSettings: ISettings) {
		this.ovSettings = ovSettings;
	}

	public isAutoPublish(): boolean {
		return this.ovSettings.autopublish;
	}

	public hasVideo(): boolean {
		return this.ovSettings.toolbarButtons.video;
	}

	public hasScreenSharing(): boolean {
		return this.ovSettings.toolbarButtons.screenShare;
	}

	public hasLayoutSpeaking(): boolean {
		return this.ovSettings.toolbarButtons.layoutSpeaking;
	}

	public hasFullscreen(): boolean {
		return this.ovSettings.toolbarButtons.fullscreen;
	}

	public hasAudio(): boolean {
		return this.ovSettings.toolbarButtons.audio;
	}

	public hasChat(): boolean {
		return this.ovSettings.chat;
	}
	public hasExit(): boolean {
		return this.ovSettings.toolbarButtons.exit;
	}

	public setScreenSharing(screenShare: boolean) {
		this.ovSettings.toolbarButtons.screenShare = screenShare;
	}

	public hasFooter(): boolean {
		return this.ovSettings.footer;
	}
	public hasToolbar(): boolean {
		return this.ovSettings.toolbar;
	}
}
