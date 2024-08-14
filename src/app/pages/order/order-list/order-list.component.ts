import { Component, OnDestroy, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';
import { Order } from '../../../models/order.model';
import { MatDialog } from '@angular/material/dialog';
import { ConfirmationDialogComponent } from '../../../components/shared/confirmation-dialog/confirmation-dialog.component';
import { OrderStatus } from '../../../models/enums/OrderStatusEnum';
import { OrderEvent } from '../../../models/enums/OrderEvent';
import { OrderEventAction } from '../../../models/event/OrderEventAction';
import { OrderService } from '../../../services/order.service';
import { OrderMessageService } from '../../../services/order-message.service';
import { OrderFormComponent } from '../order-form/order-form.component';

@Component({
  selector: 'app-order-list',
  templateUrl: './order-list.component.html',
  styleUrls: ['./order-list.component.scss']
})
export class OrderListComponent implements OnInit, OnDestroy {
  orders: Order[] = [];
  filteredOrders: Order[] = [];
  displayedColumns: string[] = [];
  private readonly destroy$: Subject<void> = new Subject();

  PRODUCT_NAME_LIMIT = 50; // Limite de caracteres para a coluna de produtos

  columns = [
    {
      columnDef: 'number',
      header: 'Número do Pedido',
      cell: (element: Order) => element.id || ''
    },
    {
      columnDef: 'productNames',
      header: 'Produtos',
      cell: (element: Order) => {
        if (!element.products) {
          return '';
        }
        const productNames = element.products.map(p => p.name).join(', ');
        return productNames.length > this.PRODUCT_NAME_LIMIT
          ? productNames.substring(0, this.PRODUCT_NAME_LIMIT) + '...'
          : productNames;
      }
    },
    {
      columnDef: 'startDate',
      header: 'Data do Pedido',
      cell: (element: Order) => element.saleDate ? new Date(element.saleDate).toLocaleDateString() : ''
    },
    {
      columnDef: 'totalAmount',
      header: 'Valor Total',
      cell: (element: Order) => element.totalAmount !== undefined ? element.totalAmount.toFixed(2) : ''
    },
    {
      columnDef: 'status',
      header: 'Status',
      cell: (element: Order) => {
        return this.getOrderStatusLabel(element.status);
      }
    }
  ];

  actions = [
    {
      name: 'edit',
      event: OrderEvent.UPDATE_ORDER,
      icon: 'edit',
      isDisabled: (order: Order) => order.status === OrderStatus.Fechado
    },
    {
      name: 'delete',
      event: OrderEvent.REMOVE_ORDER,
      icon: 'delete',
      isDisabled: (order: Order) => order.status === OrderStatus.Fechado
    },
    {
      name: 'close',
      event: OrderEvent.CLOSE_ORDER,
      icon: 'check_circle',
      isDisabled: (order: Order) => order.status === OrderStatus.Fechado
    }
  ];

  orderStatuses = [
    { value: '', label: 'Todos' },
    { value: OrderStatus.Pendente, label: 'Pendente' },
    { value: OrderStatus.Fechado, label: 'Fechado' }
  ];

  constructor(
    private router: Router,
    private orderService: OrderService,
    private orderMessageService: OrderMessageService,
    private dialog: MatDialog
  ) { }

  ngOnInit(): void {
    this.getOrders();
    this.orderMessageService.message$.pipe(
      takeUntil(this.destroy$)
    ).subscribe(() => {
      this.getOrders();
    });
  }

  private getOrders(): void {
    this.orderService.getOrders().subscribe({
      next: (orders: any) => {
        this.orders = orders;
        this.filteredOrders = this.orders; // Inicialmente, exibe todos os pedidos
        this.displayedColumns = this.columns.map(c => c.columnDef).concat(['actions']);
        console.log("Pedidos atualizados:", this.orders);
      },
      error: (err: any) => {
        console.error('Erro ao buscar pedidos:', err);
        this.orderService.showError('Erro ao buscar pedidos');
        this.router.navigate(['/dashboard']);
      }
    });
  }

  onStatusChange(status: OrderStatus): void {
    this.filteredOrders = status ? this.orders.filter(order => order.status === status) : this.orders;
  }

  navigateToOrderCreate(order?: Order): void {
    if (order) {
      this.handleOrderAction({ event: OrderEvent.UPDATE_ORDER }, order);
    } else {
      this.handleOrderAction({ event: OrderEvent.ADD_ORDER });
    }
  }

  handleOrderAction(event: OrderEventAction, order?: Order): void {
    const dialogRef = this.dialog.open(OrderFormComponent, {
      minWidth: '70vw',
      maxWidth: '80vw',
      panelClass: 'custom-dialog-class',
      data: {
        action: event,
        order: order || null,
        orders: this.orders
      }
    });

    dialogRef.afterClosed().pipe(takeUntil(this.destroy$)).subscribe(() => {
      this.getOrders(); // Atualiza a lista após o fechamento do modal
    });
  }

  handleAction(event: { event: string, element: Order }): void {
    if (event.event === OrderEvent.UPDATE_ORDER) {
      this.handleOrderAction({ event: OrderEvent.UPDATE_ORDER }, event.element);
    } else if (event.event === OrderEvent.REMOVE_ORDER) {
      this.confirmDeleteOrder(event.element);
    } else if (event.event === OrderEvent.CLOSE_ORDER) {
      this.confirmCloseOrder(event.element);
    }
  }

  private confirmDeleteOrder(order: Order): void {
    if (order.id !== undefined) {
      const dialogRef = this.dialog.open(ConfirmationDialogComponent, {
        width: '400px',
        data: { message: 'Tem certeza que deseja remover este pedido?' }
      });

      dialogRef.afterClosed().subscribe(result => {
        if (result) {
          this.orderService.removerOrder(Number(order.id));
          this.orderService.showSuccess('Pedido removido com sucesso');
          this.orderMessageService.notifyOrderUpdated();
        }
      });
    }
  }

  private confirmCloseOrder(order: Order): void {
    const dialogRef = this.dialog.open(ConfirmationDialogComponent, {
      width: '400px',
      data: { message: 'Tem certeza que deseja fechar este pedido?' }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.closeOrder(order);
      }
    });
  }

  private closeOrder(order: Order): void {
    if (order.id !== undefined) {
      order.status = OrderStatus.Fechado; // Altera o status para Fechado

      // Atualiza o pedido no serviço
      this.orderService.atualizarOrder(order).subscribe({
        next: () => {
          this.orderService.showSuccess('Pedido fechado com sucesso');
          this.orderMessageService.notifyOrderUpdated();
        },
        error: (err) => {
          console.error('Erro ao fechar pedido:', err);
          this.orderService.showError('Erro ao fechar pedido');
        }
      });
    }
  }

  handleCellClick(event: { element: Order, columnDef: string }): void {
    if (['number', 'productNames', 'startDate', 'totalAmount'].includes(event.columnDef)) {
      this.handleOrderAction({ event: OrderEvent.VIEW_ORDER }, event.element);
    }
  }

  getOrderStatusLabel(status: OrderStatus): string {
    switch (status) {
      case OrderStatus.Pendente:
        return 'Pendente';
      case OrderStatus.Fechado:
        return 'Fechado';
      default:
        return 'Desconhecido';
    }
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
