import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatBadgeModule } from '@angular/material/badge';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatOptionModule } from '@angular/material/core';
import { MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatGridListModule } from '@angular/material/grid-list';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatSelectModule } from '@angular/material/select';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatSliderModule } from '@angular/material/slider';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatTooltipModule } from '@angular/material/tooltip';
import { FlexLayoutModule } from '@angular/flex-layout';
import { OverlayContainer } from '@angular/cdk/overlay';
import { MatMenuModule } from '@angular/material/menu';

import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { ModuleWithProviders, NgModule } from '@angular/core';
import { HttpClientModule } from '@angular/common/http';

import { UserSettingsComponent } from './components/user-settings/user-settings.component';
import { ToolbarComponent } from './components/toolbar/toolbar.component';
import { VideoComponent } from './components/video/video.component';
import { ChatComponent } from './components/chat/chat.component';
import { RoomComponent } from './components/room/room.component';
import { LayoutComponent } from './components/layout/layout.component';
import { ParticipantComponent } from './components/participant/participant.component';
import { DialogTemplateComponent } from './components/material/dialog.component';

import { LinkifyPipe } from './pipes/linkify.pipe';

import { LibConfig } from './config/lib.config';
import { CdkOverlayContainer } from './config/custom-cdk-overlay';
import { DeviceService } from './services/device/device.service';
import { LocalUserService } from './services/local-user/local-user.service';
import { LoggerService } from './services/logger/logger.service';
import { PlatformService } from './services/platform/platform.service';
import { StorageService } from './services/storage/storage.service';
import { TokenService } from './services/token/token.service';
import { UtilsService } from './services/utils/utils.service';
import { LibraryConfigService } from './services/library-config/library-config.service';
import { WebrtcService } from './services/webrtc/webrtc.service';
import { ActionService } from './services/action/action.service';
import { ChatService } from './services/chat/chat.service';
import { DocumentService } from './services/document/document.service';
import { LayoutService } from './services/layout/layout.service';
import { RemoteUserService } from './services/remote-user/remote-user.service';


@NgModule({
  declarations: [
    UserSettingsComponent,
    VideoComponent,
    ToolbarComponent,
    ChatComponent,
    RoomComponent,
    LayoutComponent,
    ParticipantComponent,
    DialogTemplateComponent,
    LinkifyPipe
  ],
  imports: [
    CommonModule,
    HttpClientModule,
    FormsModule,
		ReactiveFormsModule,
    RouterModule.forRoot([]),
		MatButtonModule,
		MatCardModule,
		MatToolbarModule,
		MatIconModule,
		MatInputModule,
		MatFormFieldModule,
		MatDialogModule,
		MatTooltipModule,
		MatBadgeModule,
		MatGridListModule,
		MatSelectModule,
		MatOptionModule,
		MatProgressSpinnerModule,
		MatSliderModule,
		MatSidenavModule,
		MatSnackBarModule,
		FlexLayoutModule,
		MatMenuModule
  ],
  providers: [
    ActionService,
    CdkOverlayContainer,
		{ provide: OverlayContainer, useClass: CdkOverlayContainer },
    ChatService,
    DeviceService,
    DocumentService,
    LayoutService,
    LocalUserService,
    LoggerService,
    PlatformService,
    RemoteUserService,
    StorageService,
    TokenService,
    UtilsService,
    WebrtcService

  ],
  exports: [
    UserSettingsComponent,
    ToolbarComponent,
    ChatComponent,
    RoomComponent,
    LayoutComponent,
    CommonModule
  ],
  entryComponents: [
    DialogTemplateComponent
  ]
})


export class OpenviduComponentsLibraryModule {
  static forRoot(environment): ModuleWithProviders<OpenviduComponentsLibraryModule> {
    console.log('Library config: ', environment);
    const libConfig: LibConfig = { environment };
    return {
      ngModule: OpenviduComponentsLibraryModule,
      providers: [LibraryConfigService , {provide: 'LIB_CONFIG', useValue: libConfig}]
    };
  }

 }
