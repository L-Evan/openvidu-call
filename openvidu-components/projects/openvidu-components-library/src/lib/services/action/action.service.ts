import { Injectable } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';

import { INotificationOptions } from '../../models/notification-options.model';

@Injectable({
	providedIn: 'root'
})
export class ActionService {
	constructor(private snackBar: MatSnackBar) {}

	toggleFullscreen(elementId: string) {
		const document: any = window.document;
		const fs = document.getElementById(elementId);
		if (
			!document.fullscreenElement &&
			!document.mozFullScreenElement &&
			!document.webkitFullscreenElement &&
			!document.msFullscreenElement
		) {
			if (fs.requestFullscreen) {
				fs.requestFullscreen();
			} else if (fs.msRequestFullscreen) {
				fs.msRequestFullscreen();
			} else if (fs.mozRequestFullScreen) {
				fs.mozRequestFullScreen();
			} else if (fs.webkitRequestFullscreen) {
				fs.webkitRequestFullscreen();
			}
		} else {
			if (document.exitFullscreen) {
				document.exitFullscreen();
			} else if (document.msExitFullscreen) {
				document.msExitFullscreen();
			} else if (document.mozCancelFullScreen) {
				document.mozCancelFullScreen();
			} else if (document.webkitExitFullscreen) {
				document.webkitExitFullscreen();
			}
		}
	}

	launchNotification(options: INotificationOptions, callback): void {
		if (!options.config) {
			options.config = {
				duration: 3000,
				verticalPosition: 'top',
				horizontalPosition: 'end'
			};
		}

		const notification = this.snackBar.open(options.message, options.buttonActionText, options.config);
		if (callback) {
			notification.onAction().subscribe(() => {
				callback();
			});
		}
	}
}
