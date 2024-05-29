import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import {SupplyComponent} from './supply/supply.component';
import {AddSupplyComponent} from './add-supply/add-supply.component';

const routes: Routes = [
  {
    path: '',
    component: SupplyComponent
  },
  {
    path: 'add-supply',
    component: AddSupplyComponent
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class SupplyRoutingModule { }
