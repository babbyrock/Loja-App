import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SharedModule } from '../../components/shared/shared.module';
import { AppRoutingModule } from '../../app-routing.module';
import { OrderListComponent } from './order-list/order-list.component';
import { ReactiveFormsModule } from '@angular/forms';
import { OrderFormComponent } from './order-form/order-form.component';

@NgModule({
  declarations: [
    OrderListComponent,
    OrderFormComponent
  ],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    SharedModule,
    AppRoutingModule
  ]
})
export class OrdersModule { }
