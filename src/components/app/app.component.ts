import { Component } from '@angular/core';
import {TranslateService} from '@ngx-translate/core';
import {Title} from '@angular/platform-browser';
import { Router, NavigationStart } from '@angular/router';
import { RequestsService } from 'src/services/requests.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
})
export class AppComponent {
  // showHeader;
  showHead: boolean = false;
  clientHeight;
  constructor(public translate: TranslateService,
    private title: Title, private router: Router,private authenticationService: RequestsService ) {
      if( JSON.parse(sessionStorage.getItem('currentUser')) != null){
      const decoded = this.authenticationService.currentUserValue;
      let Language       = decoded.Language;

      }
      this.clientHeight = window.innerHeight;
    translate.setDefaultLang('ar');
    //translate.use('ar');
    // this.router.events
    //   .subscribe((event) => {
    //     if (event instanceof NavigationEnd) {
    //       switch (event.url) {
    //         case '/':
    //           this.showHeader = false;
    //           break;
    //         case '/login':
    //           this.showHeader = false;
    //           break;
    //         default:
    //           this.showHeader = true;
    //           break;
    //       }
    //     }
    //   });
    document.body.setAttribute('lang', translate.currentLang);
    if (translate.currentLang === 'ar') {
      document.body.setAttribute('dir', 'rtl');
    } else {
      document.body.setAttribute('dir', 'ltr');
    }
    translate.get('home.title').subscribe(value =>  this.title.setTitle(value));

  // on route change to '/login', set the variable showHead to false
  router.events.forEach((event) => {
    if (event instanceof NavigationStart) {
      if (event['url'] == '/login' || event['url'] == '/') {
        this.showHead = false;
      } else {
        // console.log("NU")
        this.showHead = true;
      }
    }
  });



  }

}
