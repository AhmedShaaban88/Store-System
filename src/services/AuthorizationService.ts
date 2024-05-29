import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import * as jwt_decode from 'jwt-decode';

import { User } from '../interfaces/user';

@Injectable({ providedIn: 'root' })
export class AuthorizationService {
    // public currentUserSubject: BehaviorSubject<User>;
    //  public currentUser: Observable<User>;
    // constructor(private http: HttpClient) {
    //     console.log("llllllllfgkjhj")
    //     console.log(JSON.parse(localStorage.getItem('currentUser')));
    //     var decoded = jwt_decode(JSON.parse(localStorage.getItem('currentUser'))); 
      
    //     this.currentUserSubject = new BehaviorSubject<User>(JSON.parse(localStorage.getItem('currentUser')).Message);
       
    //     this.currentUser = this.currentUserSubject.asObservable();
    // }
    // public get currentUserValue(): User {
    //     return this.currentUserSubject.value;
    // }


}