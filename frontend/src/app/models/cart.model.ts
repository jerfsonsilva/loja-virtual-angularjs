import { ProductModelServer } from './product.model';

export interface CartModelServer {
  total: number;
  data: [
    {
      product: ProductModelServer;
      numInCart: number;
    }
  ];
}

export interface CardModel {
    total:number;
    prodData:[
        {
            id:number;
            Incart: number;
        }
    ];
}
