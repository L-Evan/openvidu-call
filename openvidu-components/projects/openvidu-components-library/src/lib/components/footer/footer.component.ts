import { Component, OnDestroy, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { RemoteUserService } from '../../../public-api';
import { UserName } from '../../models/username.model';
import { VideoType } from '../../models/video-type.model';

@Component({
	selector: 'ov-footer',
	templateUrl: './footer.component.html',
	styleUrls: ['./footer.component.css']
})
export class FooterComponent implements OnInit, OnDestroy {
	participantsNames: string[] = [];
	private remoteUserNameSubscription: Subscription;

	constructor(private remoteUserService: RemoteUserService) {}
	ngOnInit(): void {
		this.subscribeToUsersName();
	}
	ngOnDestroy(): void {
		if (this.remoteUserNameSubscription) this.remoteUserNameSubscription.unsubscribe();
	}

	private subscribeToUsersName() {
		this.remoteUserNameSubscription = this.remoteUserService.remoteUserNameList.subscribe((userNameList: UserName[]) => {
			this.participantsNames = [];

			userNameList.forEach((names) => {
				if (!names.nickname.includes(VideoType.SCREEN)) {
					this.participantsNames.push(names.nickname);
				}
			});
			this.participantsNames = [...this.participantsNames];
		});
	}
}
