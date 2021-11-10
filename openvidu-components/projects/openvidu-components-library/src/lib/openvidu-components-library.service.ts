import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class OpenviduComponentsLibraryService {

  constructor() { }

  changeFontColor() {
    console.log('Change font color from service');
  }
}
