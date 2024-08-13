// product.service.ts
import { Injectable } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Product } from '../models/produto.model';
import { BehaviorSubject, Observable, of, throwError } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ProductService {
  private productsSubject = new BehaviorSubject<Product[]>(this.getProdutosFromLocalStorage());
  products$ = this.productsSubject.asObservable();

  private localStorageKey = 'produtos';

  constructor(private snackBar: MatSnackBar) { }

  showSuccess(message: string){
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

  adicionarProduto(produto: Product): Observable<Product> {
    const produtos = this.getProdutosFromLocalStorage();

    if (produto.description.length > 50) {
      console.error('A descrição do produto não pode exceder 50 caracteres.');
      return throwError(() => new Error('A descrição do produto não pode exceder 50 caracteres.'));
    }

    produto.id = this.getNextProdutoId(produtos);
    produtos.push(produto);
    this.saveProdutosToLocalStorage(produtos);

    return of(produto);
  }

  atualizarProduto(produto: Product): Observable<Product> {
    const produtos = this.getProdutosFromLocalStorage();
    const index = produtos.findIndex(p => p.id === produto.id);

    if (index !== -1) {
      produtos[index] = produto;
      this.saveProdutosToLocalStorage(produtos);
      return of(produto);
    } else {
      return throwError(() => new Error('Produto não encontrado.'));
    }
  }


  removerProduto(id: number): Observable<void> {
    console.log("entrou");
      // Recupera a lista de produtos do localStorage
      const produtos = this.getProdutosFromLocalStorage();
      console.log("entrou");


      // Encontra o índice do produto com o ID fornecido
      const index = produtos.findIndex(p => p.id === id);

      if (index !== -1) {
        // Produto encontrado, remove-o da lista
        console.log('Removendo produto com ID:', produtos[index].id);
        produtos.splice(index, 1);

        // Atualiza o localStorage e o BehaviorSubject
        this.saveProdutosToLocalStorage(produtos);
        this.productsSubject.next(produtos);

        return of();
      } else {
        // Produto não encontrado, lança um erro
        console.error('Produto não encontrado. ID:', id);
        return throwError(() => new Error('Produto não encontrado.'));
    }
  }

  public getProdutos(): Observable<Product[]> {
    const produtosJson = localStorage.getItem(this.localStorageKey);
    const produtos = produtosJson ? JSON.parse(produtosJson) : [];

    return of(produtos);
  }



  private getProdutosFromLocalStorage(): Product[] {
    const produtosJson = localStorage.getItem(this.localStorageKey);
    return produtosJson ? JSON.parse(produtosJson) : [];
  }

  private saveProdutosToLocalStorage(produtos: Product[]): void {
    localStorage.setItem(this.localStorageKey, JSON.stringify(produtos));
  }

  private getNextProdutoId(produtos: Product[]): number {
    const ids = produtos.map(p => p.id).filter(id => id !== undefined) as number[];
    if (ids.length === 0) {
      return 1;
    }
    const maxId = Math.max(...ids);
    return maxId + 1;
  }
}
