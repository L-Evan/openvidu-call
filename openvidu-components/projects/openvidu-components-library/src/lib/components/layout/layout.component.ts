import { Component, HostListener, Input, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { MatSidenav } from '@angular/material/sidenav';
import { skip, Subscription } from 'rxjs';
import { SidenavMode } from '../../models/layout.model';
import { UserModel } from '../../models/user.model';
import { ChatService } from '../../services/chat/chat.service';
import { LayoutService } from '../../services/layout/layout.service';

@Component({
	selector: 'ov-layout',
	templateUrl: './layout.component.html',
	styleUrls: ['./layout.component.css']
})
export class LayoutComponent implements OnInit, OnDestroy {
	@Input() localUsers: UserModel[];
	@Input() remoteUsers: UserModel[];
	@ViewChild('sidenav') chatSidenav: MatSidenav;
	sidenavMode: SidenavMode = SidenavMode.SIDE;

	private readonly SIDENAV_WIDTH_LIMIT_MODE = 790;
	private chatSubscription: Subscription;
	private layoutWidthSubscription: Subscription;

	@HostListener('window:resize')
	sizeChange() {
		this.layoutService.update();
	}

	constructor(private layoutService: LayoutService, private chatService: ChatService) {}

	ngOnInit(): void {
		this.layoutService.initialize();
		this.subscribeToChatComponent();
		this.subscribeToLayoutWidth();
	}

	ngOnDestroy() {
		this.layoutService.clear();
		if (this.chatSubscription) {
			this.chatSubscription.unsubscribe();
		}
		if (this.layoutWidthSubscription) {
			this.layoutWidthSubscription.unsubscribe();
		}
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
}
