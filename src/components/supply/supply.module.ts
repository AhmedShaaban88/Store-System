import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SupplyRoutingModule } from './supply-routing.module';
import { SupplyComponent } from './supply/supply.component';
import { AddSupplyComponent } from './add-supply/add-supply.component';
import { BsDatepickerModule } from 'ngx-bootstrap/datepicker';
import {defineLocale, arLocale} from 'ngx-bootstrap';
import { AngularMultiSelectModule } from 'angular2-multiselect-dropdown';
import { ToastrModule } from 'ngx-toastr';
import {TranslateModule} from '@ngx-translate/core';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {SharedModule} from '../shared/shared/shared.module';

defineLocale('ar', arLocale);
@NgModule({
  declarations: [SupplyComponent, AddSupplyComponent],
  imports: [
    CommonModule,
    SupplyRoutingModule,
    TranslateModule,
    SharedModule,
    ReactiveFormsModule,
    FormsModule,
    BsDatepickerModule.forRoot(),
    ToastrModule,
    AngularMultiSelectModule,

  ]
})
export class SupplyModule { }
