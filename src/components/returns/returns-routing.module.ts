import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import {ReturnsComponent} from './returns/returns.component';
import {AddReturnsComponent} from './add-returns/add-returns.component';
const routes: Routes = [
  {
    path: '',
    component: ReturnsComponent
  },
  {
    path: 'add-returns',
    component: AddReturnsComponent
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ReturnsRoutingModule { }
