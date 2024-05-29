import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import {StockComponent} from './stock/stock.component';
import {CategoriesComponent} from './categories/categories.component';
import {ItemsComponent} from './items/items.component';
import {BackupComponent} from './backup/backup.component';

const routes: Routes = [
  {
    path: 'stock',
    component: StockComponent
  },
  {
    path: 'items',
    component: ItemsComponent
  },
  {
    path: 'categories',
    component: CategoriesComponent
  },
  {
    path: 'backup',
    component: BackupComponent
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class SettingsRoutingModule { }
