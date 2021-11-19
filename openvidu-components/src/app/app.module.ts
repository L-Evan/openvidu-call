import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { AppRoutingModule } from './app.routing.module';
import { AppComponent } from './app.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

import { environment } from 'src/environments/environment';

// openvidu-components-library

import { OpenviduComponentsLibraryModule, UserSettingsComponent, ToolbarComponent, ChatComponent, RoomComponent, LayoutComponent, FooterComponent } from 'openvidu-components-library';
import { CallComponent } from './openvidu-call/call.component';
import { DashboardComponent } from './dashboard/dashboard.component';

@NgModule({
  declarations: [
    AppComponent,
    DashboardComponent,
    CallComponent
  ],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    OpenviduComponentsLibraryModule.forRoot(environment),
    AppRoutingModule // Order is important, AppRoutingModule must be the last import for useHash working
  ],
  providers: [
    UserSettingsComponent,
    ToolbarComponent,
    ChatComponent,
    RoomComponent,
    LayoutComponent,
    FooterComponent,
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
