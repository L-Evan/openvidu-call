import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { OpenviduComponentsLibraryComponent } from './openvidu-components-library.component';
import { ToolbarComponent } from './toolbar/toolbar.component';
import { UserSettingsComponent } from './components/user-settings/user-settings.component';



@NgModule({
  declarations: [
    OpenviduComponentsLibraryComponent,
    ToolbarComponent,
    UserSettingsComponent
  ],
  imports: [
    CommonModule
  ],
  exports: [
    OpenviduComponentsLibraryComponent,
    ToolbarComponent,
    CommonModule
  ],
})
export class OpenviduComponentsLibraryModule { }
