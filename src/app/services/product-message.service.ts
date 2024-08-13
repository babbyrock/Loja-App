// product-message.service.ts
import { Injectable } from '@angular/core';
import { MessageService } from './message.service';

@Injectable({
  providedIn: 'root'
})
export class ProductMessageService {
  constructor(private messageService: MessageService<void>) {}

  notifyProductUpdated(): void {
    console.log("Notificando atualização do produto"); // Verifique se o log aparece
    this.messageService.notify();
  }

  get message$() {
    return this.messageService.message$;
  }
}
