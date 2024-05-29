import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { UserSettingsRoutingModule } from './user-settings-routing.module';
import { PrimaryComponent } from './primary/primary.component';
import { LogHistoryComponent } from './log-history/log-history.component';
import { TabsModule } from 'ngx-bootstrap/tabs';
import {TranslateModule} from '@ngx-translate/core';
import { ToastrModule } from 'ngx-toastr';
import {ReactiveFormsModule, FormsModule} from '@angular/forms';

@NgModule({
  declarations: [PrimaryComponent, LogHistoryComponent],
  imports: [
    CommonModule,
    UserSettingsRoutingModule,
    TabsModule
  ]
})
export class UserSettingsModule { }
