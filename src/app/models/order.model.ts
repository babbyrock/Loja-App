import { OrderStatus } from "./enums/OrderStatusEnum";
import { Product } from "./produto.model";

export interface Order {
  id?: number;
  status: OrderStatus;
  products: Product[];
  saleDate: Date;
  totalAmount: number;
  totalproduct?: number;
}
