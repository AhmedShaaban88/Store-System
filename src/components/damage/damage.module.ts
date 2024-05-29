import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import {TranslateModule} from '@ngx-translate/core';
import { DamageRoutingModule } from './damage-routing.module';
import { DamageComponent } from './damage/damage.component';
import { AddDamageComponent } from './add-damage/add-damage.component';
import { BsDatepickerModule } from 'ngx-bootstrap/datepicker';
import {defineLocale} from 'ngx-bootstrap';
import { arLocale } from 'ngx-bootstrap/locale';
import { AngularMultiSelectModule } from 'angular2-multiselect-dropdown';
import { ToastrModule } from 'ngx-toastr';
import {ReactiveFormsModule, FormsModule} from '@angular/forms';
import {SharedModule} from '../shared/shared/shared.module';

defineLocale('ar', arLocale);
@NgModule({
  declarations: [DamageComponent, AddDamageComponent],
  imports: [
    CommonModule,
    DamageRoutingModule,
    BsDatepickerModule.forRoot(),
    TranslateModule,
    AngularMultiSelectModule,
    ToastrModule,
    ReactiveFormsModule,
    FormsModule,
    SharedModule
  ]
})
export class DamageModule { }
