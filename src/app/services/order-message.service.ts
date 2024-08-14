import { Injectable } from '@angular/core';
import { MessageService } from './message.service';

@Injectable({
  providedIn: 'root'
})
export class OrderMessageService {
  constructor(private messageService: MessageService<void>) {}

  notifyOrderUpdated(): void {
    console.log("Notificando atualização do pedido");
    this.messageService.notify();
  }

  get message$() {
    return this.messageService.message$;
  }
}
