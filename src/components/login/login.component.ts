// import { Component, OnInit } from '@angular/core';
// import {TranslateService} from '@ngx-translate/core';
// import {Title} from '@angular/platform-browser';
// import {FormBuilder, Validators} from '@angular/forms';
import {Component, HostListener, OnInit} from '@angular/core';
import {TranslateService} from '@ngx-translate/core';
import {Title} from '@angular/platform-browser';
import {RequestsService} from '../../services/requests.service';
import {ToastrService} from 'ngx-toastr';
import {FormArray, FormBuilder, FormGroup, Validators} from '@angular/forms';
import { Router } from '@angular/router';
import { first } from 'rxjs/operators';
import {User} from '../../interfaces/user';
import { BehaviorSubject, Observable } from 'rxjs';


// import {BsLocaleService} from 'ngx-bootstrap';
@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {
  loginForm: FormGroup;
  loading = false;
  submitted = false;
  returnUrl: string;
  public currentUserSubject: BehaviorSubject<User>;
  public currentUser: Observable<User>;
   constructor(  
    private formBuilder: FormBuilder,
     private translate: TranslateService, private title: Title,
    private request: RequestsService,
     private toastr: ToastrService,
    private fb: FormBuilder,
    private route: Router,
    ) 
    { }

  ngOnInit() {
    this.loginForm = this.formBuilder.group({
      username: ['', Validators.required],
      password: ['', Validators.required]
  });
  }
    // convenience getter for easy access to form fields
    get f() { return this.loginForm.controls; }

    onSubmit() {
        this.submitted = true;

        // stop here if form is invalid
        if (this.loginForm.invalid) {
            return;
        }

        this.loading = true;
      //  this.request.login(this.f.username.value, this.f.password.value).subscribe(value =>  console.log("sss"));
      console.log(this.f.username.value, this.f.password.value)
      this.request.login(this.f.username.value, this.f.password.value)
      .subscribe(  data => {
        console.log("ikkkkkkkkkkkkkkkkkkkkkkkkkkkkkk")
             if(data.Status=="Success"){
               // بيدخل هناااااااااااااااااااااا
              console.log(data)
            
              // if(data && data.Message) {
              //   // store user details and jwt token in local storage to keep user logged in between page refreshes
              // sessionStorage.setItem('currentUser', JSON.stringify(data));
               // this.currentUserSubject.next(data);
        //  this.request.currentUserSubject = new BehaviorSubject<User>(JSON.parse(sessionStorage.getItem('currentUser')).Message);
        //  console.log(this.request.currentUserSubject)
         // this.request.currentUser = this.request.currentUserSubject.asObservable();
                this.route.navigate(['/settings/categories']);
             }
            if(data.Status=="Invalid") {
              document.getElementById("ErrorMsg").innerHTML = data.Message;

             // this.toastr.success(data.Message);
            }
 
           },
          // error => {
          //     // this.alertService.error(error);
          //     // this.loading = false;
          // }
          );
}
public get currentUserValue(): User {

  return this.currentUserSubject.value;
}
    }

 
  


