import { CartService } from 'src/app/services/cart.service';
import { Component, OnInit } from '@angular/core';
import { CartModelServer } from 'src/app/models/cart.model';
import { ProductModelServer } from 'src/app/models/product.model';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css']
})
export class HeaderComponent implements OnInit {
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

  constructor(public cartService:CartService) {

   }

  ngOnInit() {
    this.cartService.cardTotal$.subscribe(p=>{
      this.cardTotal = p;
    });

    this.cartService.cardData$.subscribe(p=>{
      this.cardData = p;
    })

  }

}
