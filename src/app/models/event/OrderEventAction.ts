// models/event/event-action.model.ts
import { OrderEvent } from '../enums/OrderEvent';
import { ProductEvent } from '../enums/ProductEvent';
import { Order } from '../order.model';
import { Product } from '../produto.model';

export interface OrderEventAction {
  event: OrderEvent;
  order?: Order;
}
