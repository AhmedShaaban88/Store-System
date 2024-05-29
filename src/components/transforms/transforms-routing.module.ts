import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import {TransformComponent} from './transform/transform.component';
import {AddTransformComponent} from './add-transform/add-transform.component';
const routes: Routes = [
  {
    path: '',
    component: TransformComponent
  },
  {
    path: 'add-transform',
    component: AddTransformComponent
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class TransformsRoutingModule { }
