import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import {TransformComponent} from './transform/transform.component';
import {AddTransformComponent} from './add-transform/add-transform.component';
import { TransformsRoutingModule } from './transforms-routing.module';
import { BsDatepickerModule } from 'ngx-bootstrap/datepicker';
import { defineLocale } from 'ngx-bootstrap/chronos';
import {TranslateModule} from '@ngx-translate/core';
import { arLocale } from 'ngx-bootstrap/locale';
import { ToastrModule } from 'ngx-toastr';
import {ReactiveFormsModule, FormsModule} from '@angular/forms';
import { AngularMultiSelectModule } from 'angular2-multiselect-dropdown';
import {SharedModule} from '../shared/shared/shared.module';

defineLocale('ar', arLocale);

@NgModule({
  declarations: [
    TransformComponent,
    AddTransformComponent
  ],
  imports: [
    CommonModule,
    SharedModule,
    TransformsRoutingModule,
    TranslateModule,
    ReactiveFormsModule,
    FormsModule,
    BsDatepickerModule.forRoot(),
    ToastrModule,
    AngularMultiSelectModule,

  ]
})
export class TransformsModule { }
