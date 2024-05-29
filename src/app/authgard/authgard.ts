import { Injectable } from '@angular/core';
import { Router, CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';

import { AuthorizationService } from '../../services/AuthorizationService';
import { LoginComponent } from '../../components/login/login.component';
import * as jwt_decode from 'jwt-decode';
import { forEach } from '@angular/router/src/utils/collection';
import { ModuleCategory,ModuleData,PageData } from 'src/interfaces/user';
import {switchMap,map} from 'rxjs/operators'
import { RequestsService } from 'src/services/requests.service';
@Injectable({ providedIn: 'root' })
export class AuthGuard implements CanActivate {
    listFinished = false;
     lists = [];
     list = [];
     //public  UserPageDataArr: PageData[] = [];
     public UrlArr :string[]=[];
  // بتجيب بيانات من الcomponant ده 
    constructor(private router: Router,
      private authenticationService:RequestsService 
      //,
      //private HeaderComponent:HeaderComponent
      ) {}
    canActivate(route: ActivatedRouteSnapshot , state: RouterStateSnapshot) {
       // console.log("canActivate")
     //   const currentUser = this.authenticationService.currentUserValue;
        const  decodejwt= this.authenticationService.currentUserValue;
      //  console.log(decodejwt)
        let UserPageData=  decodejwt.UserPageData
        //.UserPageData;
        if (UserPageData instanceof Array) {
            UserPageData.forEach(childObj=> {
              this.UrlArr.push(JSON.parse(childObj).PageAuthorizeUrl)
            })
          }
          else{
          this.UrlArr.push(JSON.parse(UserPageData).PageAuthorizeUrl)
          }

        if (decodejwt) {
            // ناقصي جزء ال role هنا//////////////////// 
            // var yy= state.url;
            // console.log(yy+ "gggggggggggggggggggggggggggggggggggggg")
         // check if route is restricted by role
         //ممكن احط في  ال role دي array من الصفح واشوف موجوده فيه ولا لاءه
         if (this.UrlArr.indexOf(state.url) === -1) {
        //    // role not authorised so redirect to home page
                this.router.navigate(['/login']);
                 return false;
         }
            // authorised so return true
            //console.log("true")
            return true;
        }
         // هنا لو لقي ليه بيانات  غير كده هيرجع علي ال login
       // console.log(state.url + "state.url");
        // not logged in so redirect to login page with the return url
        this.router.navigate(['/login'], { queryParams: { returnUrl: state.url }});

        return false;
    }

}
