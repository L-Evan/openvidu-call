import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { AppRoutingModule } from './app-routing.module';
import { environment } from 'src/environments/environment';

// Material
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatToolbarModule } from '@angular/material/toolbar';

// OpenVidu Components
import {
	OpenviduComponentsLibraryModule,
	UserSettingsComponent,
	ToolbarComponent,
	RoomComponent,
	LayoutComponent
} from 'openvidu-components-library';

// Application Components
import { AppComponent } from './app.component';
import { CallComponent } from './components/call/call.component';
import { HomeComponent } from './components/home/home.component';

// Services

@NgModule({
	declarations: [AppComponent, HomeComponent, CallComponent],
	imports: [
		BrowserModule,
		BrowserAnimationsModule,
		FormsModule,
		ReactiveFormsModule,
		MatProgressSpinnerModule,
		MatToolbarModule,
		OpenviduComponentsLibraryModule.forRoot(environment),
		AppRoutingModule // Order is important, AppRoutingModule must be the last import for useHash working
	],
	providers: [UserSettingsComponent, ToolbarComponent, RoomComponent, LayoutComponent],
	bootstrap: [AppComponent]
})
export class AppModule {
	ngDoBootstrap() {}
}
