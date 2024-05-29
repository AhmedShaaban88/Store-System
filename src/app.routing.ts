import { RouterModule, Routes } from '@angular/router';
import {NgModule} from '@angular/core';
import {NotFoundComponent} from './components/shared/not-found/not-found.component';
import {HomeComponent} from './components/home/home.component';
import {LoginComponent} from './components/login/login.component';
import {PrintComponent} from './components/print/print.component';
// import {TransformsModule} from './components/transforms/transforms.module';
import { AuthGuard } from './app/authgard';
export const AppRoutes: Routes = [
  {
  //   path: '',
  //   component: HomeComponent,
  // },
  // // { path: '',
  // //   redirectTo: '/login',
  // //   pathMatch: 'full'
  // // },
  // {
  //   path: 'login',
  //   component: LoginComponent,
  // },
  path: '',
  redirectTo: '/login',
  pathMatch: 'full'
},
{
  path: 'login',
  component: LoginComponent,
},

  {
    path: 'transforms',
    canActivate: [AuthGuard],
    loadChildren: './components/transforms/transforms.module#TransformsModule'
    /*loadChildren: () => import('./components/transforms/transforms.module').then(mod => mod.TransformsModule),*/
  },
  {
    path: 'supply',
    canActivate: [AuthGuard],
    loadChildren: './components/supply/supply.module#SupplyModule'
    /*loadChildren: () => import('./components/transforms/transforms.module').then(mod => mod.TransformsModule),*/
  },
  {
    path: 'maintenance',
    canActivate: [AuthGuard],
    loadChildren: './components/maintenance/maintenance.module#MaintenanceModule'
    /*loadChildren: () => import('./components/transforms/transforms.module').then(mod => mod.TransformsModule),*/
  },
  {
    path: 'damage',
    canActivate: [AuthGuard],
    loadChildren: './components/damage/damage.module#DamageModule'
    /*loadChildren: () => import('./components/transforms/transforms.module').then(mod => mod.TransformsModule),*/
  },
  {
    path: 'returns',
    canActivate: [AuthGuard],
    loadChildren: './components/returns/returns.module#ReturnsModule'
    /*loadChildren: () => import('./components/transforms/transforms.module').then(mod => mod.TransformsModule),*/
  },
  {
    path: 'settings',
    canActivate: [AuthGuard],
    loadChildren: './components/settings/settings.module#SettingsModule',
    
    /*loadChildren: () => import('./components/settings/settings.module').then(mod => mod.SettingsModule),*/
  },
  {
    path: 'usersetting',
    canActivate: [AuthGuard],
    loadChildren: './components/user-settings/user-settings.module#UserSettingsModule',

    /*loadChildren: () => import('./components/settings/settings.module').then(mod => mod.SettingsModule),*/
  },
  {
    path: 'print',
    component: PrintComponent,
  },
  {
    path: '**',
    component: NotFoundComponent
  }
];
@NgModule({
  imports: [
    RouterModule.forRoot(AppRoutes, { enableTracing: false }),
  ],
  exports: [RouterModule],
})
export class AppRoutingModule { }
