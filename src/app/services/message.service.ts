// src/app/services/message.service.ts
import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class MessageService<T> {
  private messageSource = new Subject<T>();
  message$ = this.messageSource.asObservable();

  notify(message: T): void {
    this.messageSource.next(message);
  }
}
