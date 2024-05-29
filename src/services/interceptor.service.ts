import { Injectable } from '@angular/core';
import {
   HttpInterceptor, HttpHandler, HttpRequest
} from '@angular/common/http';
@Injectable()
export class InterceptorService implements HttpInterceptor {
  constructor() {}
  intercept(req: HttpRequest<any>, next: HttpHandler) {
    const authReq = req.clone({setHeaders: {'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET,HEAD,OPTIONS,POST,PUT',
      }});
    return next.handle(authReq);
  }
}
