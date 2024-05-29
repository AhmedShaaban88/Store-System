import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import {PrimaryComponent} from './primary/primary.component';
import {LogHistoryComponent} from './log-history/log-history.component';


const routes: Routes = [
  {
    path: '',
    component: PrimaryComponent
  },
  {
    path: 'historylogin',
    component: LogHistoryComponent
  },


];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class UserSettingsRoutingModule { }
