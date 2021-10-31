import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { NgxSpinnerService } from 'ngx-spinner';
import { CartModelServer } from 'src/app/models/cart.model';
import { ProductModelServer } from 'src/app/models/product.model';
import { CartService } from 'src/app/services/cart.service';
import { OrderService } from 'src/app/services/order.service';

@Component({
  selector: 'app-checkout',
  templateUrl: './checkout.component.html',
  styleUrls: ['./checkout.component.css'],
})
export class CheckoutComponent implements OnInit {

  private productEmpty: ProductModelServer = {
    id: 0,
    name: '',
    category: '',
    description: '',
    price: 0,
    quantity: 0,
    images: '',
    image: '',
  };

  cardData:CartModelServer = {
    total:0,
    data:[{
      product:{...this.productEmpty},
      numInCart:0
    }]
  };

  cardTotal:number = 0;

  constructor(
    private cartService: CartService,
    private orderService: OrderService,
    private router: Router,
    private spinner: NgxSpinnerService
  ) {
     
    this.cartService.cardTotal$.subscribe(p=>{
      this.cardTotal = p;
    });

    this.cartService.cardData$.subscribe(p=>{
      this.cardData = p;
    })
  }

  ngOnInit(): void {}

  onCheckout(){
    this.spinner.show().then(p=>{
      this.cartService.CheckoutFromCart(2);
    });
  }
}
