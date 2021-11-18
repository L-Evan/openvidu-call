import { Component, HostListener, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { MatSidenav } from '@angular/material/sidenav';
import { skip, Subscription } from 'rxjs';
import { SidenavMode } from '../../models/layout.model';
import { UserModel } from '../../models/user.model';
import { ChatService } from '../../services/chat/chat.service';
import { LayoutService } from '../../services/layout/layout.service';
import { LocalUserService } from '../../services/local-user/local-user.service';
import { RemoteUserService } from '../../services/remote-user/remote-user.service';

@Component({
	selector: 'ov-layout',
	templateUrl: './layout.component.html',
	styleUrls: ['./layout.component.css']
})
export class LayoutComponent implements OnInit, OnDestroy {
	@ViewChild('sidenav') chatSidenav: MatSidenav;
	localUsers: UserModel[] = [];
	remoteUsers: UserModel[] = [];
	sidenavMode: SidenavMode = SidenavMode.SIDE;

	private readonly SIDENAV_WIDTH_LIMIT_MODE = 790;
	private chatSubscription: Subscription;
	private layoutWidthSubscription: Subscription;
	private localUsersSubscription: Subscription;
	private remoteUsersSubscription: Subscription;

	@HostListener('window:resize')
	sizeChange() {
		this.layoutService.update();
	}

	constructor(
		private remoteUserService: RemoteUserService,
		private localUserService: LocalUserService,
		private layoutService: LayoutService,
		private chatService: ChatService
	) {}

	ngOnInit(): void {
		this.layoutService.initialize();
		this.subscribeToUsers();
		this.subscribeToChatComponent();
		this.subscribeToLayoutWidth();

	}

	ngOnDestroy() {
		this.layoutService.clear();
		this.localUsers = [];
		this.remoteUsers = [];
		if (this.chatSubscription) this.chatSubscription.unsubscribe();
		if (this.layoutWidthSubscription) this.layoutWidthSubscription.unsubscribe();
		if (this.localUsersSubscription) this.localUsersSubscription.unsubscribe();
		if (this.remoteUsersSubscription) this.remoteUsersSubscription.unsubscribe();
	}

	private subscribeToChatComponent() {
		this.chatSubscription = this.chatService.toggleChatObs.pipe(skip(1)).subscribe((opened) => {
			opened ? this.chatSidenav.open() : this.chatSidenav.close();
			this.layoutService.update(300);
		});
	}

	private subscribeToLayoutWidth() {
		this.layoutWidthSubscription = this.layoutService.layoutWidthObs.subscribe((width) => {
			this.sidenavMode = width <= this.SIDENAV_WIDTH_LIMIT_MODE ? SidenavMode.OVER : SidenavMode.SIDE;
		});
	}

	private subscribeToUsers() {
		this.localUsersSubscription = this.localUserService.OVUsers.subscribe((users) => {
			this.localUsers = users;
		});

		this.remoteUsersSubscription = this.remoteUserService.remoteUsers.subscribe((users) => {
			this.remoteUsers = users;
		});
	}
}
