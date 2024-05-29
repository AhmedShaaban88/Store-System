import { Component, OnInit,Injectable } from '@angular/core';
import * as $ from 'jquery';
import { RequestsService } from 'src/services/requests.service';
import { ModuleCategory,ModuleData,PageData } from 'src/interfaces/user';
import { TranslateService } from '@ngx-translate/core';


@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css']
})
// export class HeaderComponent implements OnInit {

//   constructor() {}
//   ngOnInit() {}
//   changeRoute($this) {
//     $('.dropdown-toggle').each((i, v) => {
//       $(v).removeClass('drop-active');
//     });
//     $($this).parent().prev('a').addClass('drop-active');
//   }

// }
export class HeaderComponent implements OnInit {
  public  UserModuleDataArr: ModuleData[] = [];
  public  UserModuleCategoryDataArr: ModuleCategory[] = [];
  public  UserPageDataArr: PageData[] = [];
  public UrlArr :string[]=[];
  public PageDatfromjwt:any;
  Language: string;
  constructor(private authenticationService: RequestsService ,
     private translate: TranslateService) {
    if( JSON.parse(sessionStorage.getItem('currentUser')) != null){

      const decoded = this.authenticationService.currentUserValue;
      //console.log(currentUseree+"بشوف لو هتضرب هنا لو مفيش jwt");
      this.authenticationService.currentUser.subscribe( currentUser => { currentUser = currentUser;
       //var decoded  = jwt_decode(currentUseree);
      let UserModuleData = decoded.UserModuleData;
      this.Language       = decoded.Language;

      //console.log( this.Language === 'True');
      if(this.Language === 'True'){
        this.translate.use('ar');
        document.body.setAttribute('dir', 'rtl');
        document.body.setAttribute('lang', 'ar');
      }
      else{
        this.translate.use('en');
        document.body.setAttribute('dir', 'ltr');
        document.body.setAttribute('lang', 'en');

      }
      
 
      
     
     // console.log("LanguageLanguage+Language+Language+Language+Language+Language+Language+");
      //console.log(this.Language+"Language");
      let ImageUserPath  = decoded.ImageUserPath;
      let UserModuleCategoryData=  decoded.UserModuleCategoryData;
      this.PageDatfromjwt=  decoded.UserPageData;
      if (UserModuleData instanceof Array) {
        UserModuleData.forEach(childObj=> { 
          this.UserModuleDataArr.push(JSON.parse(childObj))})
     }
     else{
      this.UserModuleDataArr.push(JSON.parse(UserModuleData))
     }
    
     if (UserModuleCategoryData instanceof Array) {
      UserModuleCategoryData.forEach(childObj=> {
        this.UserModuleCategoryDataArr.push(JSON.parse(childObj))})
    }
    else{
    this.UserModuleCategoryDataArr.push(JSON.parse(UserModuleCategoryData))
    }
    if (this.PageDatfromjwt instanceof Array) {
      this. PageDatfromjwt.forEach(childObj=> {
        this.UserPageDataArr.push(JSON.parse(childObj))
      })
    }
    else{
    this.UserPageDataArr.push(JSON.parse(this.PageDatfromjwt))
    }
    
        });

      }
    }
  ngOnInit() {}
  changeRoute($this) {
    $('.dropdown-toggle').each((i, v) => {
      $(v).removeClass('drop-active');
    });
    $($this).parent().prev('a').addClass('drop-active');
  }


  filterPage(ModuleCategoryId){
    return this.UserPageDataArr.filter(x => x.ModuleCategoryId == ModuleCategoryId);
}
filterModuleCategory(ModuleId){
  return
   this.UserModuleCategoryDataArr.filter(x => x.ModuleId == ModuleId);
}
public get ReturnDecoded():any {
  return this.PageDatfromjwt;
}
}
