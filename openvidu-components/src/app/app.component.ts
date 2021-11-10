import { Component } from '@angular/core';
import { ToolbarComponent } from 'projects/openvidu-components-library/src/lib/toolbar/toolbar.component';
import {OpenviduComponentsLibraryService} from 'projects/openvidu-components-library/src/lib/openvidu-components-library.service';
import { UserModel } from 'projects/openvidu-components-library/src/lib/models/User';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  title = 'openvidu-components';
  toolbarColor = ''

  participants: UserModelPro[] =  [];

  constructor(private componentService: OpenviduComponentsLibraryService, private component: ToolbarComponent){

    this.participants = [new UserModelPro()];
  }

  clickButton() {
    console.log('button clicked');
    this.componentService.changeFontColor();
    this.toolbarColor = this.component.getRandomColor();
  }
}

export class UserModelPro extends UserModel{

  surname: string = '';
  constructor(){
    super();
    this.surname = 'IM PRO';
  }
}
