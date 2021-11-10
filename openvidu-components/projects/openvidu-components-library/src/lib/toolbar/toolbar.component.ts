import { Component, Input, OnInit } from '@angular/core';

import {UserModel} from '../models/User';

@Component({
  selector: 'ov-toolbar',
  templateUrl: './toolbar.component.html',
  styleUrls: ['./toolbar.component.css'],
})
export class ToolbarComponent implements OnInit {
  @Input() color: string = '#000000';

  user: UserModel;
  participants: UserModel[];
  constructor() {}

  ngOnInit(): void {
    this.user = new UserModel();
    this.participants = [this.user]
    // setInterval(()=> {
    //   this.getRandomColor();

    // }, 2000);
  }

  changeFontColor() {
    this.getRandomColor();
    console.log(this.color);
  }

  getRandomColor() {
    const letters = '0123456789ABCDEF';
    let color = '#';
    for (let i = 0; i < 6; i++) {
      color += letters[Math.floor(Math.random() * 16)];
    }
    return color;
  }
}
