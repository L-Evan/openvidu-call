import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { AppComponent } from './app.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

import { environment } from 'src/environments/environment';

// openvidu-components-library

import { OpenviduComponentsLibraryModule, UserSettingsComponent, ToolbarComponent, ChatComponent, RoomComponent, LayoutComponent, FooterComponent } from 'openvidu-components-library';



@NgModule({
  declarations: [
    AppComponent
  ],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    OpenviduComponentsLibraryModule.forRoot(environment)
  ],
  providers: [
    UserSettingsComponent,
    ToolbarComponent,
    ChatComponent,
    RoomComponent,
    LayoutComponent,
    FooterComponent
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
