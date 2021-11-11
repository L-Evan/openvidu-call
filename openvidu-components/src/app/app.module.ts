import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { AppComponent } from './app.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

import { environment } from 'src/environments/environment';

// openvidu-components-library

import { OpenviduComponentsLibraryModule, UserSettingsComponent } from 'openvidu-components-library';

@NgModule({
  declarations: [
    AppComponent
  ],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    OpenviduComponentsLibraryModule.forRoot(environment),
    OpenviduComponentsLibraryModule
  ],
  providers: [
    UserSettingsComponent
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
