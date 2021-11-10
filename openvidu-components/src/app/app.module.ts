import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { AppComponent } from './app.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

// openvidu-components-library
import {OpenviduComponentsLibraryModule} from 'projects/openvidu-components-library/src/lib/openvidu-components-library.module';
import { ToolbarComponent } from 'projects/openvidu-components-library/src/lib/toolbar/toolbar.component';

@NgModule({
  declarations: [
    AppComponent
  ],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    OpenviduComponentsLibraryModule
  ],
  providers: [ToolbarComponent],
  bootstrap: [AppComponent]
})
export class AppModule { }
