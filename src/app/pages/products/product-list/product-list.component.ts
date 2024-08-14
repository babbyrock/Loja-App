import { Component, OnDestroy, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';
import { ProductService } from '../../../services/product.service';
import { Product } from '../../../models/produto.model';
import { ProductMessageService } from '../../../services/product-message.service';
import { ProductEvent } from '../../../models/enums/ProductEvent';
import { MatDialog } from '@angular/material/dialog';
import { ProductFormComponent } from '../product-form/product-form.component';
import { ConfirmationDialogComponent } from '../../../components/shared/confirmation-dialog/confirmation-dialog.component';
import { EventAction } from '../../../models/event/EventAction';

@Component({
  selector: 'app-product-list',
  templateUrl: './product-list.component.html',
  styleUrls: ['./product-list.component.scss']
})
export class ProductListComponent implements OnInit, OnDestroy {
  products: Product[] = [];
  filteredProducts: Product[] = [];
  displayedColumns: string[] = [];
  private readonly destroy$: Subject<void> = new Subject();
  searchText: string = '';

  columns = [
    { columnDef: 'name', header: 'Nome', cell: (element: Product) => element.name },
    { columnDef: 'amount', header: 'Quantidade', cell: (element: Product) => element.amount },
    { columnDef: 'price', header: 'Preço', cell: (element: Product) => element.price },
    { columnDef: 'description', header: 'Descrição', cell: (element: Product) => element.description }
  ];

  actions = [
    { name: 'edit', event: ProductEvent.EDIT_PRODUCT_EVENT, icon: 'edit' },
    { name: 'delete', event: ProductEvent.DELETE_PRODUCT_EVENT, icon: 'delete' }
  ];

  constructor(
    private router: Router,
    private productService: ProductService,
    private productMessageService: ProductMessageService,
    private dialog: MatDialog
  ) { }

  ngOnInit(): void {
    this.getProducts();
    this.productMessageService.message$.pipe(
      takeUntil(this.destroy$)
    ).subscribe(() => {
      this.getProducts();
    });
  }

  private getProducts(): void {
    this.productService.getProdutos().subscribe({
      next: (produtos) => {
        this.products = produtos;
        this.filteredProducts = produtos;
        this.displayedColumns = this.columns.map(c => c.columnDef).concat(['actions']);
        console.log("Produtos atualizados:", this.products);
      },
      error: (err: any) => {
        console.error('Erro ao buscar produtos:', err);
        this.productService.showError('Erro ao buscar produtos');
        this.router.navigate(['/dashboard']);
      }
    });
  }

  applyFilter(event: Event): void {
    const input = event.target as HTMLInputElement;
    const value = input.value.trim().toLowerCase();
    this.searchText = value;
    this.filteredProducts = (this.products ?? []).filter(product => {
      return Object.values(product).some(val =>
        val.toString().toLowerCase().includes(this.searchText)
      );
    });
  }



  navigateToProductCreate(product?: Product): void {
    if (product) {
      this.handleProductAction({ event: ProductEvent.EDIT_PRODUCT_EVENT }, product);
    } else {
      this.handleProductAction({ event: ProductEvent.ADD_PRODUCT_EVENT });
    }
  }

  handleProductAction(event: EventAction, product?: Product): void {
    const dialogRef = this.dialog.open(ProductFormComponent, {
      width: '90%',
      panelClass: 'custom-dialog-class',
      data: {
        action: event,
        product: product || null,
        products: this.products
      }
    });

    dialogRef.afterClosed().pipe(takeUntil(this.destroy$)).subscribe(() => {
    });
  }

  handleAction(event: { event: string, element: Product }): void {
    if (event.event === ProductEvent.EDIT_PRODUCT_EVENT) {
      this.handleProductAction({ event: ProductEvent.EDIT_PRODUCT_EVENT }, event.element);
    } else if (event.event === ProductEvent.DELETE_PRODUCT_EVENT) {
      if (event.element.id !== undefined) {
        const dialogRef = this.dialog.open(ConfirmationDialogComponent, {
          width: '400px',
          data: { message: 'Tem certeza que deseja remover este produto?' }
        });

        dialogRef.afterClosed().subscribe(result => {
          if (result) {
            this.productService.removerProduto(event.element.id ? event.element.id : 0);
            this.productService.showSuccess('Produto removido com sucesso');
            this.productMessageService.notifyProductUpdated();
          }
        });
      }
    }
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
