import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import {DamageComponent} from './damage/damage.component';
import {AddDamageComponent} from './add-damage/add-damage.component';

const routes: Routes = [
  {
    path: '',
    component: DamageComponent
  },
  {
    path: 'add-damage',
    component: AddDamageComponent
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class DamageRoutingModule { }
