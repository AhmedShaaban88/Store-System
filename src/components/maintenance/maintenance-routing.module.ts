import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import {MaintenanceComponent} from './maintenance/maintenance.component';
import {AddMaintenanceComponent} from './add-maintenance/add-maintenance.component';

const routes: Routes = [
  {
    path: '',
    component: MaintenanceComponent
  },
  {
    path: 'add-maintenance',
    component: AddMaintenanceComponent
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class MaintenanceRoutingModule { }
