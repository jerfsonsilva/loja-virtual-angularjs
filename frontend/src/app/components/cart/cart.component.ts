import { CartService } from 'src/app/services/cart.service';
import { Component, OnInit } from '@angular/core';
import { CartModelServer } from 'src/app/models/cart.model';
import { ProductModelServer } from 'src/app/models/product.model';

@Component({
  selector: 'app-cart',
  templateUrl: './cart.component.html',
  styleUrls: ['./cart.component.css']
})
export class CartComponent implements OnInit {
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
  subTotal:number = 0;

  constructor(public cartService:CartService) {
  }

  ngOnInit(): void {
    this.cartService.cardTotal$.subscribe(p=>{
      this.cardTotal = p;
    });

    this.cartService.cardData$.subscribe(p=>{
      this.cardData = p;
    })
  }

  ChangeQuantity(index:number, increment:boolean ){
    this.cartService.UpdateCartItems(index,increment);
  }

}
