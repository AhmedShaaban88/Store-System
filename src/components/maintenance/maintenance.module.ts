import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import {TranslateModule} from '@ngx-translate/core';
import { MaintenanceRoutingModule } from './maintenance-routing.module';
import { MaintenanceComponent } from './maintenance/maintenance.component';
import { AddMaintenanceComponent } from './add-maintenance/add-maintenance.component';
import { BsDatepickerModule } from 'ngx-bootstrap/datepicker';
import {defineLocale} from 'ngx-bootstrap';
import { arLocale } from 'ngx-bootstrap/locale';
import { AngularMultiSelectModule } from 'angular2-multiselect-dropdown';
import { ToastrModule } from 'ngx-toastr';
import {ReactiveFormsModule, FormsModule} from '@angular/forms';
import {SharedModule} from '../shared/shared/shared.module';

defineLocale('ar', arLocale);
@NgModule({
  declarations: [MaintenanceComponent, AddMaintenanceComponent],
  imports: [
    CommonModule,
    MaintenanceRoutingModule,
    BsDatepickerModule.forRoot(),
    TranslateModule,
    AngularMultiSelectModule,
    ToastrModule,
    ReactiveFormsModule,
    FormsModule,
    SharedModule
  ]
})
export class MaintenanceModule { }
