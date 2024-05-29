import { Component, OnInit } from '@angular/core';
import {Title} from '@angular/platform-browser';
import {TranslateService} from '@ngx-translate/core';
@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit {

  constructor(public translate: TranslateService, private title: Title) { }

  ngOnInit() {
    this.translate.get('home.title').subscribe(value =>  this.title.setTitle(value));

  }

}
