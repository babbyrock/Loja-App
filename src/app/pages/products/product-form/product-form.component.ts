import { Component, Inject, OnDestroy, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { finalize, Subject } from 'rxjs';
import { ProductService } from '../../../services/product.service';
import { Product } from '../../../models/produto.model';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { ProductEvent } from '../../../models/enums/ProductEvent';

@Component({
  selector: 'app-product-form',
  templateUrl: './product-form.component.html',
  styleUrls: ['./product-form.component.scss']
})
export class ProductFormComponent implements OnInit, OnDestroy {
  private readonly destroy$: Subject<void> = new Subject();
  public form!: FormGroup;
  title: string = '';

  estadoSalvar = 'post';
  product: Product = {} as Product;

  get f(): any {
    return this.form.controls;
  }

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: any,
    private productService: ProductService,
    private formBuilder: FormBuilder,
    private router: Router,
    private route: ActivatedRoute,
    private dialogRef: MatDialogRef<ProductFormComponent>
  ) {
    this.title = data.action.event === ProductEvent.EDIT_PRODUCT_EVENT ? 'Editar Produto' : 'Novo Produto';
    this.estadoSalvar = data.action.event === ProductEvent.EDIT_PRODUCT_EVENT ? 'put' : 'post';
    this.product = data.product || ({} as Product);;
  }

  ngOnInit(): void {
    this.form = this.formBuilder.group({
      name: [this.product.name || '', Validators.required],
      price: [this.product.price || '', Validators.required],
      description: [this.product.description || '', [Validators.required, Validators.maxLength(50)]],
      amount: [this.product.amount || 1, [Validators.required, Validators.min(1)]] // Alterado aqui
    });

    this.route.paramMap.subscribe(params => {
      const id = Number(params.get('id'));
      if (id) {
        this.estadoSalvar = 'put';
        this.loadProduct(id);
      }
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private loadProduct(id: number): void {
    this.productService.getProdutos().subscribe(produtos => {
      console.log('Produtos:', produtos);

      this.product = produtos.find(p => p.id === id) as Product;

      if (this.product) {
        this.form.patchValue(this.product);
      } else {
        this.productService.showError('Produto não encontrado');
        this.router.navigate(['/produtos']);
      }
    }, error => {
      console.error('Erro ao carregar produtos:', error);
      this.productService.showError('Erro ao carregar produtos');
      this.router.navigate(['/produtos']);
    });
  }

  saveProduct(): void {
    if (this.form.valid) {

      this.product = this.estadoSalvar === 'post'
        ? { ...this.form.value }
        : { id: this.product.id, ...this.form.value };

      const saveOperation = this.estadoSalvar === 'post'
        ? this.productService.adicionarProduto(this.product)
        : this.productService.atualizarProduto(this.product);

      saveOperation.pipe(
        finalize(() => this.dialogRef.close()) // Fecha o modal quando a operação termina
      ).subscribe({
        next: () => {
          this.productService.showSuccess(this.estadoSalvar === 'post' ? 'Produto criado' : 'Produto atualizado');
          this.router.navigate(['/produtos']); // Navegar para outra página
        },
        error: () => {
          this.productService.showError('Ocorreu um erro');
        }
      });
    } else {
      this.productService.showError('Formulário inválido');
    }
  }

  cancel(): void {
    this.dialogRef.close(); // Fechar o diálogo
  }

}
