import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { OrderService } from 'src/app/services/order.service';

@Component({
  selector: 'app-thankyou',
  templateUrl: './thankyou.component.html',
  styleUrls: ['./thankyou.component.css'],
})
export class ThankyouComponent implements OnInit {
  message: string = '';
  orderId: number = 0;
  products:ProductResponseModel[];
  cartTotal: number = 0;

  constructor(private router:Router, private orderService:OrderService) {
    const navigation = this.router.getCurrentNavigation();
    const state = navigation?.extras.state as {
      message:string,
      products: ProductResponseModel[],
      orderId:number,
      total:number
    };
    console.log(state);
    this.message = state.message;
    this.products = state.products;
    this.orderId = state.orderId;
    this.cartTotal = state.total;


  }

  ngOnInit(): void {}
}

interface ProductResponseModel {
  id: number;
  title: String;
  description: String;
  price: number;
  quantityOrdered: number;
  image: String;
}
