import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import {ReturnsComponent} from './returns/returns.component';
import {AddReturnsComponent} from './add-returns/add-returns.component';
import { ReturnsRoutingModule } from './returns-routing.module';
import { BsDatepickerModule } from 'ngx-bootstrap/datepicker';
import { defineLocale } from 'ngx-bootstrap/chronos';
import {TranslateModule} from '@ngx-translate/core';
import { arLocale } from 'ngx-bootstrap/locale';
import { ToastrModule } from 'ngx-toastr';
import {ReactiveFormsModule, FormsModule} from '@angular/forms';
import { AngularMultiSelectModule } from 'angular2-multiselect-dropdown';

defineLocale('ar', arLocale);

@NgModule({
  declarations: [
    ReturnsComponent,
    AddReturnsComponent
  ],
  imports: [
    CommonModule,
    ReturnsRoutingModule,
    TranslateModule,
    ReactiveFormsModule,
    FormsModule,
    BsDatepickerModule.forRoot(),
    ToastrModule,
    AngularMultiSelectModule,

  ]
})
export class ReturnsModule { }
