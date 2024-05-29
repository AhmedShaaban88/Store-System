import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { SettingsRoutingModule } from './settings-routing.module';
import { StockComponent } from './stock/stock.component';
import { CategoriesComponent } from './categories/categories.component';
import { ItemsComponent } from './items/items.component';
import {TranslateModule} from '@ngx-translate/core';
import { ToastrModule } from 'ngx-toastr';
import { TooltipModule } from 'ngx-bootstrap/tooltip';
import { AngularMultiSelectModule } from 'angular2-multiselect-dropdown';
import {ReactiveFormsModule, FormsModule} from '@angular/forms';
import { BackupComponent } from './backup/backup.component';
import { TabsModule } from 'ngx-bootstrap/tabs';
import { TimepickerModule } from 'ngx-bootstrap/timepicker';

@NgModule({
  declarations: [StockComponent, CategoriesComponent, ItemsComponent, BackupComponent],
  imports: [
    CommonModule,
    SettingsRoutingModule,
    TranslateModule,
    ToastrModule,
    TooltipModule,
    AngularMultiSelectModule,
    ReactiveFormsModule,
    FormsModule,
    TabsModule,
    TimepickerModule
  ]
})
export class SettingsModule { }
