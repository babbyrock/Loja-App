import { Component, Inject, OnDestroy, OnInit } from "@angular/core";
import { FormBuilder, FormGroup, Validators } from "@angular/forms";
import { finalize, Subject, takeUntil } from "rxjs";
import { ProductService } from "../../../services/product.service";
import { OrderService } from "../../../services/order.service";
import { MAT_DIALOG_DATA, MatDialogRef } from "@angular/material/dialog";
import { Product } from "../../../models/produto.model";
import { Order } from "../../../models/order.model";
import { OrderStatus } from "../../../models/enums/OrderStatusEnum";
import { OrderEvent } from "../../../models/enums/OrderEvent";
import { MatTableDataSource } from "@angular/material/table";
import { Router } from "@angular/router";
import { OrderEventAction } from "../../../models/event/OrderEventAction";
import { OrderMessageService } from "../../../services/order-message.service";

@Component({
  selector: 'app-order-form',
  templateUrl: './order-form.component.html',
  styleUrls: ['./order-form.component.scss']
})
export class OrderFormComponent implements OnInit, OnDestroy {
  form!: FormGroup;
  title: string = '';

  selectedProduct: Product | null = null;
  order!: Order;
  products: Product[] = [];
  productsExcludedUpdate: Product[] = [];
  orderProducts: { product: Product; quantity: number; totalAmount: number }[] = [];
  tempOrderProducts: { productId: number; quantity: number }[] = [];
  selectedProductId: number = 0;
  quantity: number = 1;
  orderTotal: number = 0;
  orderStatuses = Object.values(OrderStatus);
  displayedColumns: string[] = ['name', 'price', 'quantity', 'description', 'total',  'actions'];
  dataSource = new MatTableDataSource<any>();
  stockError: string | null = null;
  private readonly destroy$: Subject<void> = new Subject();
  estadoSalvar = 'post';
  isReadOnly: boolean = false;

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: { action: OrderEventAction; order: Order | null; orders: Order[] },
    private formBuilder: FormBuilder,
    private productService: ProductService,
    private orderService: OrderService,
    private dialogRef: MatDialogRef<OrderFormComponent>,
    private router: Router,
    private orderMessageService: OrderMessageService,
  ) {
    this.title = data.action.event === OrderEvent.UPDATE_ORDER ? 'Editar Pedido' : 'Novo Pedido';
    this.estadoSalvar = data.action.event === OrderEvent.UPDATE_ORDER ? 'update' : 'post';
  }

  ngOnInit(): void {
    this.isReadOnly = this.data.action.event === OrderEvent.VIEW_ORDER;
    this.dataSource.data = this.orderProducts;
    this.form = this.formBuilder.group({
      selectedProductId: [null, Validators.required],
      quantity: [1, [Validators.required, Validators.min(1)]]
    });
    this.loadOrder();

    this.loadProducts();
    if (this.data.order) {
      this.tempOrderProducts = this.data.order.products.map((p: any) => ({
        productId: p.id,
        quantity: p.amount || 1
      }));
      this.updateOrderProducts();
    }

    this.form.valueChanges.pipe(takeUntil(this.destroy$)).subscribe(() => {
      this.checkStock();
    });
  }

  loadOrder(): void {
    if (this.data.order && this.data.order.products) {
      this.dataSource.data = this.data.order.products;
      this.calculateOrderTotal();
    } else {
      this.dataSource.data = [];
    }
  }



  loadProducts(): void {
    this.productService.getProdutos().pipe(takeUntil(this.destroy$)).subscribe((products: any) => {
      this.products = products;
    });
  }

  removeProduct(productElement: any): void {
    const data = this.dataSource.data;
    const index = data.indexOf(productElement);

    productElement.product.amount = this.products.find(p => p.id === productElement.product.id)?.amount + productElement.quantity;

    this.productsExcludedUpdate.push(productElement.product)
    this.tempOrderProducts = this.tempOrderProducts.filter(p => p.productId !== productElement.product.id);
    console.log( this.productsExcludedUpdate);



    if (index !== -1) {
      data.splice(index, 1);
      this.dataSource.data = data;
      this.calculateOrderTotal();
    }
  }

  calculateOrderTotal(): void {
    const data = this.dataSource.data;
    this.orderTotal = data.reduce((acc, productElement) => acc + productElement.totalAmount, 0);
  }



  onProductSelect(event: any): void {
    this.form.patchValue({ selectedProductId: event.value });
    this.checkStock();
  }

  addProduct(): void {
    var tempOrderProduct = null;
    this.checkStock();
    const productId = this.form.value.selectedProductId;
    const quantity = this.form.value.quantity;

    const tempQuantity = Number(this.products.find(p => p.id === productId)?.amount);
    const product = this.products.find(p => p.id === productId);



    if (product) {
      var result = product.amount;
    if(this.stockError === null) var result = (tempQuantity - quantity);

      const existingProductIndex = this.tempOrderProducts.findIndex(tp => tp.productId === productId);

      if (existingProductIndex >= 0 && result < product.amount ) {
        tempOrderProduct = this.tempOrderProducts[existingProductIndex].quantity += quantity;
      } else if(existingProductIndex === -1){
        this.tempOrderProducts.push({ productId, quantity });

      }

      if(this.stockError === null)
        this.updateOrderProducts();
    }
  }

  updateOrderProducts(): void {
    this.orderProducts = this.tempOrderProducts.map(tempProduct => {
      const product = this.products.find(p => p.id === tempProduct.productId);
      if (product) {
        if(this.selectedProduct?.id === product.id)
            product.amount = product.amount - this.form.value.quantity;
        return {
          product,
          quantity: tempProduct.quantity,
          totalAmount: tempProduct.quantity * product.price
        };
      }
      return { product: null, quantity: 0, totalAmount: 0 };
    }).filter(op => op.product !== null);

    this.calculateTotal();
    this.dataSource.data = [...this.orderProducts];
  }

  calculateTotal(): void {
    this.orderTotal = this.orderProducts.reduce((acc, op) => acc + op.totalAmount, 0);
  }

  saveOrder(): void {

    if(this.productsExcludedUpdate.length > 0){
      this.productsExcludedUpdate.map(p => {
        this.productService.atualizarProduto(p);
      });
    }
    if (this.dataSource.data.length > 0) {
      let saveOperation;

      if(this.estadoSalvar === 'post'){
        const order: Order = {
          ...this.form.value,
          products: this.tempOrderProducts.map(tp => {
            let product = this.products.find(p => p.id === tp.productId);
            if(product) this.productService.atualizarProduto(product);


            return {...product,
              amount: tp.quantity}
          }),
          id: this.data.order?.id,
          totalAmount: this.orderTotal,
          saleDate: new Date(),
          status: OrderStatus.Pendente,
          totalproduct: this.tempOrderProducts.length
        };
        saveOperation = this.orderService.adicionarOrder(order);

      }

      if(this.estadoSalvar === 'update'){
        const order: Order = {
          ...this.form.value,
          products: this.dataSource.data.map(d => {
            let product = this.products.find(p => p.id === d.product.id);
            console.log(product);

            if(product) this.productService.atualizarProduto(product);
            return {
              ...this.products.find(p => p.id === d.product.id),
              amount: this.tempOrderProducts.find(tp => tp.productId === d.product.id)?.quantity
            }
          }),
          id: this.data.order?.id,
          totalAmount: this.orderTotal,
          saleDate: new Date(),
          status: OrderStatus.Pendente,
          totalproduct: this.tempOrderProducts.length
        };
        saveOperation = this.orderService.atualizarOrder(order);
      }



      if(saveOperation){
        saveOperation.pipe(
          finalize(() => this.dialogRef.close())
        ).subscribe({
          next: () => {
            this.orderService.showSuccess(this.estadoSalvar === 'post' ? 'Pedido criado' : 'Pedido atualizado');
          },
          error: (err: any) => {
            console.error('Erro ao salvar pedido:', err);
            this.orderService.showError('Ocorreu um erro ao salvar o pedido');
          }
        });
      }
    } else if(this.estadoSalvar === 'update'){

        this.orderService.removerOrder(Number(this.data.order?.id));
        this.orderService.showSuccess('Pedido removido com sucesso');
        this.orderMessageService.notifyOrderUpdated();
        this.dialogRef.close();
    } else {
      this.orderService.showError('Formulário inválido');
    }
  }

  cancel(): void {
    this.dialogRef.close();
  }

  verifyProductSelect(event: any): void {
    const productId = event.value;

    this.selectedProduct = this.products.find(p => p.id === productId) || null;

    this.form.patchValue({ selectedProductId: productId });
    this.checkStock();
  }

  ngOnDestroy(): void {
    document.body.style.overflow = 'auto';
    this.destroy$.next();
    this.destroy$.complete();
  }

  checkStock(): void {

    const productId = this.form.value.selectedProductId;

    const quantity = this.form.value.quantity;
    const product = this.products.find(p => p.id === productId);
    this.selectedProductId = this.form.value.selectedProductId;;
    this.selectedProduct = this.products.find(p => p.id === productId) || null;

    if (product) {
      if (quantity > product.amount) {
        this.stockError = `Quantidade máxima disponível para este produto é ${product.amount}.`;
        this.form.get('quantity')?.setErrors({ stockError: true });
        this.selectedProduct = null;
      } else if (quantity <= 0) {
        this.stockError = `Quantidade deve ser maior que zero.`;
        this.form.get('quantity')?.setErrors({ min: true });
        this.selectedProduct = null;
      } else {
        this.stockError = null;
        this.form.get('quantity')?.setErrors(null);
      }
    } else {
      this.stockError = null;
    }
  }
}
