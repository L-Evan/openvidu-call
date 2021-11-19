import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { DashboardComponent } from './dashboard/dashboard.component';
import { CallComponent } from './openvidu-call/call.component';

const routes: Routes = [
	{ path: '', component: DashboardComponent },
	{ path: 'call', component: CallComponent },

];
@NgModule({
  imports: [RouterModule.forRoot(routes, {useHash: true})],
  exports: [RouterModule],
})
export class AppRoutingModule { }
