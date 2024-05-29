import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import {HttpClientModule, HttpClient, HTTP_INTERCEPTORS} from '@angular/common/http';
import {TranslateModule, TranslateLoader} from '@ngx-translate/core';
import {TranslateHttpLoader} from '@ngx-translate/http-loader';
import { AppComponent } from './components/app/app.component';
import { HeaderComponent } from './components/shared/header/header.component';
import { FooterComponent } from './components/shared/footer/footer.component';
import { NotFoundComponent } from './components/shared/not-found/not-found.component';
import {AppRoutingModule} from './app.routing';
import { HomeComponent } from './components/home/home.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import {InterceptorService} from './services/interceptor.service';
import { ToastrModule } from 'ngx-toastr';
import {ReactiveFormsModule, FormsModule} from '@angular/forms';
import { TooltipModule } from 'ngx-bootstrap/tooltip';
import { LoginComponent } from './components/login/login.component';
import { AngularMultiSelectModule } from 'angular2-multiselect-dropdown';
import { PrintComponent } from './components/print/print.component';
import {SharedModule} from './components/shared/shared/shared.module';
import { TabsModule } from 'ngx-bootstrap/tabs';
import { TimepickerModule } from 'ngx-bootstrap/timepicker';

export function HttpLoaderFactory(http: HttpClient) {
  return new TranslateHttpLoader(http, "./assets/i18n/", ".json");
}
@NgModule({
  declarations: [
    AppComponent,
    HeaderComponent,
    FooterComponent,
    NotFoundComponent,
    HomeComponent,
    LoginComponent,
    PrintComponent,
  ],
  imports: [
    BrowserModule,
    HttpClientModule,
    TranslateModule.forRoot({
      loader: {
        provide: TranslateLoader,
        useFactory: HttpLoaderFactory,
        deps: [HttpClient]
      }
    }),
    AppRoutingModule,
    BrowserAnimationsModule,
    ToastrModule.forRoot({
      positionClass: 'toast-top-left',
      progressBar: true,
      preventDuplicates: true
    }),
    ReactiveFormsModule,
    TooltipModule.forRoot(),
    FormsModule,
    AngularMultiSelectModule,
    SharedModule,
    TabsModule.forRoot(),
    TimepickerModule.forRoot()
  ],
  providers: [ 
    { provide: HTTP_INTERCEPTORS,
     useClass: InterceptorService, 
     multi: true }],
  exports: [TranslateModule, ToastrModule, ReactiveFormsModule, TooltipModule, FormsModule, AngularMultiSelectModule],
  bootstrap: [AppComponent]
})
export class AppModule { }
