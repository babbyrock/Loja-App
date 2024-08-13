import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ProductFormComponent } from './product-form/product-form.component';
import { ProductListComponent } from './product-list/product-list.component';
import { SharedModule } from '../../components/shared/shared.module';
import { AppRoutingModule } from '../../app-routing.module';

@NgModule({
  declarations: [
    ProductFormComponent,
    ProductListComponent
  ],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    SharedModule,
    AppRoutingModule
  ]
})
export class ProductsModule { }
