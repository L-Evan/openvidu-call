import { Component, OnInit } from '@angular/core';
import { UserModel } from 'openvidu-components-library';

@Component({
  selector: 'app-participant-test',
  templateUrl: './participant-test.component.html',
  styleUrls: ['./participant-test.component.scss']
})
export class ParticipantTestComponent implements OnInit {

  user: UserModel;
  constructor() { }

  ngOnInit(): void {
    this.user = new UserModel();
    this.user.setLocal(true);
  }

}
