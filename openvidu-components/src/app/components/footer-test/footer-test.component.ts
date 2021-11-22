import { Component, OnInit } from '@angular/core';
import { RemoteUserService } from 'openvidu-components-library';
import { ConnectionEvent } from 'openvidu-browser';

@Component({
  selector: 'app-footer-test',
  templateUrl: './footer-test.component.html',
  styleUrls: ['./footer-test.component.scss']
})
export class FooterTestComponent implements OnInit {

  constructor(private remoteUserService: RemoteUserService) { }

  ngOnInit(): void {
    setTimeout(() => {
      const event: any = {connection: { connectionId: 'test'}};
      this.remoteUserService.addUserName(event);
    }, 5000);

  }

}
