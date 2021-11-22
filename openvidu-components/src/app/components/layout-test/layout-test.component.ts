import { Component, OnInit } from '@angular/core';
import { RemoteUserService, ChatService } from 'openvidu-components-library';

@Component({
	selector: 'app-layout-test',
	templateUrl: './layout-test.component.html',
	styleUrls: ['./layout-test.component.scss']
})
export class LayoutTestComponent implements OnInit {
	connectionIds: string[] = [];
	constructor(private chatService: ChatService, private remoteUserService: RemoteUserService) {}

	ngOnInit(): void {}

	addParticipant() {
		const id = `test${Math.random()}`;
		const event: any = { connection: { connectionId: id } };
		this.connectionIds.push(id);
		this.remoteUserService.add(event, null);
	}

	deleteParticipant() {
		if (this.connectionIds.length > 0) {
			this.remoteUserService.removeUserByConnectionId(this.connectionIds.pop());
		}
	}

	toggleChat() {
		this.chatService.toggleChat();
	}
}
