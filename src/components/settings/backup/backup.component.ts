import { Component, OnInit } from '@angular/core';
import {TranslateService} from '@ngx-translate/core';
import {Title} from '@angular/platform-browser';
import {RequestsService} from '../../../services/requests.service';
import {ToastrService} from 'ngx-toastr';
import {FormBuilder, FormGroup, FormControl} from '@angular/forms';
declare var $: any;
@Component({
  selector: 'app-backup',
  templateUrl: './backup.component.html',
  styleUrls: ['./backup.component.css']
})
export class BackupComponent implements OnInit {
  clock = new FormGroup({
    clockControl: new FormControl(new Date())
  });
  clock2 = new FormGroup({
    repeate: new FormControl(0),
    clockStart: new FormControl(new Date()),
    clockEnd: new FormControl(new Date()),
  });
  meridians;
  constructor(public translate: TranslateService, private title: Title,
              private request: RequestsService, private toastr: ToastrService,
              private fb: FormBuilder) { }

  ngOnInit() {
    this.translate.get('header.links.settings.links.backup').subscribe(value =>  this.title.setTitle(value));
    this.meridians = this.translate.currentLang === 'ar' ?  ['صباحا', 'مساءا'] : ['AM', 'PM'];
    $('timepicker table').css('margin', 'auto');
  }
  ss() {
    console.log(this.clock.get('clockControl').value)
  }

}
