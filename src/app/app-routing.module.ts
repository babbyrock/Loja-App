import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ProductListComponent } from './pages/products/product-list/product-list.component';
import { ProductFormComponent } from './pages/products/product-form/product-form.component';
import { OrderFormComponent } from './pages/order/order-form/order-form.component';
import { OrderListComponent } from './pages/order/order-list/order-list.component';

const routes: Routes = [
  { path: 'produtos', component: ProductListComponent },
  { path: 'pedidos', component: OrderListComponent },
  { path: 'produtos/criar', component: ProductFormComponent},
  { path: 'pedidos/criar', component: OrderFormComponent},
  { path: 'produtos/editar/:id', component: ProductFormComponent },
  { path: 'pedidos/editar/:id', component: OrderFormComponent },
  { path: '', redirectTo: '/produtos', pathMatch: 'full' },
  { path: '**', redirectTo: '/produtos' }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
