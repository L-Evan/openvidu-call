import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { AppRoutingModule } from './app.routing.module';
import { AppComponent } from './app.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

import { environment } from 'src/environments/environment';

// openvidu-components-library

import { CallComponent } from './openvidu-call/call.component';
import { ToolbarTestComponent } from './components/toolbar-test/toolbar-test.component';
import { DashboardComponent } from './dashboard/dashboard.component';
import { ChatTestComponent } from './components/chat-test/chat-test.component';
import { FooterTestComponent } from './components/footer-test/footer-test.component';
import { LayoutTestComponent } from './components/layout-test/layout-test.component';
import { ParticipantTestComponent } from './components/participant-test/participant-test.component';

import { OpenviduComponentsLibraryModule, UserSettingsComponent, ChatComponent, ToolbarComponent, RoomComponent, LayoutComponent, FooterComponent } from 'openvidu-components-library';
import { MatButtonModule } from '@angular/material/button';

@NgModule({
  declarations: [
    AppComponent,
    DashboardComponent,
    CallComponent,
    ToolbarTestComponent,
    ChatTestComponent,
    FooterTestComponent,
    LayoutTestComponent,
    ParticipantTestComponent
  ],
  imports: [
    BrowserModule,
    MatButtonModule,
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
