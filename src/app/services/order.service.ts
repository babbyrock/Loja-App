import { Injectable } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Order } from '../models/order.model';
import { BehaviorSubject, Observable, of, throwError } from 'rxjs';
import { Product } from '../models/produto.model';

@Injectable({
  providedIn: 'root'
})
export class OrderService {
  private ordersSubject = new BehaviorSubject<Order[]>(this.getOrdersFromLocalStorage());
  orders$ = this.ordersSubject.asObservable();

  private localStorageKey = 'orders';

  constructor(private snackBar: MatSnackBar) { }

  showSuccess(message: string): void {
    this.snackBar.open(message, 'X', {
      duration: 3000,
      horizontalPosition: 'right',
      verticalPosition: 'top'
    });
  }

  showError(message: string): void {
    this.snackBar.open(message, 'X', {
      duration: 3000,
      horizontalPosition: 'right',
      verticalPosition: 'top',
      panelClass: ['error-snackbar']
    });
  }

  adicionarOrder(order: Order): Observable<Order> {
    console.log("teste");

    const orders = this.getOrdersFromLocalStorage();

    order.id = this.getNextOrderId(orders);
    orders.push(order);
    this.saveOrdersToLocalStorage(orders);

    this.ordersSubject.next(orders);

    return of(order);
  }

  atualizarOrder(order: Order): Observable<Order> {
    const orders = this.getOrdersFromLocalStorage();
    const index = orders.findIndex(o => o.id === order.id);
    if (index !== -1) {
      console.log(order);

      orders[index] = order;
      console.log(orders);
      this.saveOrdersToLocalStorage(orders);
      this.ordersSubject.next(orders);
      return of(order);
    } else {
      return throwError(() => new Error('Order não encontrado.'));
    }
  }

  removerOrder(id: number): Observable<void> {
    const orders = this.getOrdersFromLocalStorage();


    const index = orders.findIndex(o => o.id === id);
    console.log(id);


    if (index !== -1) {
      orders.splice(index, 1);
      this.saveOrdersToLocalStorage(orders);
      this.ordersSubject.next(orders);

      return of();
    } else {
      return throwError(() => new Error('Order não encontrado.'));
    }
  }

  public getOrders(): Observable<Order[]> {
    const ordersJson = localStorage.getItem(this.localStorageKey);
    const orders = ordersJson ? JSON.parse(ordersJson) : [];

    return of(orders);
  }

  private getOrdersFromLocalStorage(): Order[] {
    const ordersJson = localStorage.getItem(this.localStorageKey);
    return ordersJson ? JSON.parse(ordersJson) : [];
  }

  public getProdutos(): Observable<Product[]> {
    const produtosJson = localStorage.getItem(this.localStorageKey);
    const produtos = produtosJson ? JSON.parse(produtosJson) : [];

    return of(produtos);
  }


  private saveOrdersToLocalStorage(orders: Order[]): void {
    localStorage.setItem(this.localStorageKey, JSON.stringify(orders));
  }

  private getNextOrderId(orders: Order[]): number {
    const ids = orders.map(o => o.id).filter(id => id !== undefined) as number[];
    if (ids.length === 0) {
      return 1;
    }
    const maxId = Math.max(...ids);
    return maxId + 1;
  }
}
