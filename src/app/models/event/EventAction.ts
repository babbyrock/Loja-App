// models/event/event-action.model.ts
import { ProductEvent } from '../enums/ProductEvent';
import { Product } from '../produto.model';

export interface EventAction {
  event: ProductEvent;
  product?: Product;
}
