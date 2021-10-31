import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { NavigationExtras, Router } from '@angular/router';
import { BehaviorSubject } from 'rxjs';
import { CardModel, CartModelServer } from '../models/cart.model';
import { OrderService } from './order.service';
import { ProductService } from './product.service';
import { ProductModelServer } from '../models/product.model';
import { environment } from 'src/environments/environment';
import { ToastrService } from 'ngx-toastr';
import { NgxSpinnerService } from 'ngx-spinner';
@Injectable({
  providedIn: 'root',
})
export class CartService {
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
  /* Data variable to store the cart information on the clients local storage */
  private cardDataClient: CardModel = {
    total: 0,
    prodData: [
      {
        Incart: 0,
        id: 0,
      },
    ],
  };

  /* Data variable to store cart information on the server */
  private cartDataServe: CartModelServer = {
    total: 0,
    data: [
      {
        numInCart: 0,
        product: { ...this.productEmpty },
      },
    ],
  };

  /* Observables for the components to subscribe */
  cardTotal$ = new BehaviorSubject<number>(0);
  cardData$ = new BehaviorSubject<CartModelServer>(this.cartDataServe);

  constructor(
    private http: HttpClient,
    private productService: ProductService,
    private orderService: OrderService,
    private router: Router,
    private toast: ToastrService,
    private spinner: NgxSpinnerService
  ) {
    this.cardTotal$.next(this.cartDataServe.total);
    this.cardData$.next(this.cartDataServe);
    //Get the information from local storage
    let cart = localStorage.getItem('cart');
    let info: CardModel = cart != null ? JSON.parse(cart) : null;

    if (info != null && info.prodData[0].Incart != 0) {
      this.cardDataClient = info;

      //Loop through each entry and put it in the cartDataServe object
      this.cardDataClient.prodData.forEach((p) => {
        this.productService
          .getSingleProduct(p.id)
          .subscribe((actualProductInfo: ProductModelServer) => {
            if (this.cartDataServe.data[0].numInCart === 0) {
              this.cartDataServe.data[0].numInCart = p.Incart;
              this.cartDataServe.data[0].product = actualProductInfo;

              //create CalculateTotal function and replace it here
              this.CalculateTotal();
              this.cardDataClient.total = this.cartDataServe.total;
              localStorage.setItem('cart', JSON.stringify(this.cardDataClient));
            } else {
              //CartDataServer already has some entry in it
              this.cartDataServe.data.push({
                numInCart: p.Incart,
                product: actualProductInfo,
              });

              //create CalculateTotal function and replace it here
              this.CalculateTotal();
              this.cardDataClient.total = this.cartDataServe.total;
              localStorage.setItem('cart', JSON.stringify(this.cardDataClient));
            }

            this.cardData$.next({ ...this.cartDataServe });
          });
      });
    }
  }

  AddProductToCart(id: number, quantity?: number) {
    this.productService.getSingleProduct(id).subscribe((prod) => {
      //1.if de cart is empty
      if (this.cartDataServe.data[0].product.id == 0) {
        this.cartDataServe.data[0].product = prod;
        this.cartDataServe.data[0].numInCart =
          quantity != undefined ? quantity : 1;

        this.cardDataClient.prodData[0].Incart =
          this.cartDataServe.data[0].numInCart;
        this.cardDataClient.prodData[0].id = prod.id;

        this.CalculateTotal();

        this.cardDataClient.total = this.cartDataServe.total;

        localStorage.setItem('cart', JSON.stringify(this.cardDataClient));
        this.cardData$.next({ ...this.cartDataServe });

        this.toast.success(`${prod.name} added to the cart`, 'Product Added', {
          timeOut: 1500,
          progressBar: true,
          progressAnimation: 'increasing',
          positionClass: 'toast-top-right',
        });
      } else {
        //2.if the cart has some items
        let index = this.cartDataServe.data.findIndex((p) => {
          return p.product.id == prod.id;
        });
        //2.a if that item is already in the cart
        if (index != -1) {
          if (quantity != undefined && quantity <= prod.quantity) {
            this.cartDataServe.data[index].numInCart =
              this.cartDataServe.data[index].numInCart < prod.quantity
                ? quantity
                : prod.quantity;
          } else {
            this.cartDataServe.data[index].numInCart =
              this.cartDataServe.data[index].numInCart < prod.quantity
                ? this.cartDataServe.data[index].numInCart + 1
                : prod.quantity;
          }

          this.cardDataClient.prodData[index].Incart =
            this.cartDataServe.data[index].numInCart;

          this.CalculateTotal();
          this.cardDataClient.total = this.cartDataServe.total;

          localStorage.setItem('cart', JSON.stringify(this.cardDataClient));

          this.toast.info(
            `${prod.name} quantity updated in the cart`,
            'Product updated',
            {
              timeOut: 1500,
              progressBar: true,
              progressAnimation: 'increasing',
              positionClass: 'toast-top-right',
            }
          );
        } else {
          //2.b if that item is not in the cart
          this.cartDataServe.data.push({
            numInCart: 1,
            product: prod,
          });

          this.cardDataClient.prodData.push({
            Incart: 1,
            id: prod.id,
          });

          this.toast.success(
            `${prod.name} added to the cart`,
            'Product Added',
            {
              timeOut: 1500,
              progressBar: true,
              progressAnimation: 'increasing',
              positionClass: 'toast-top-right',
            }
          );

          this.CalculateTotal();
          this.cardDataClient.total = this.cartDataServe.total;

          localStorage.setItem('cart', JSON.stringify(this.cardDataClient));
          this.cardData$.next({ ...this.cartDataServe });
        } //End of else
      }
    });
  }

  UpdateCartItems(index: number, increase: boolean) {
    let data = this.cartDataServe.data[index];

    if (increase) {
      data.numInCart < data.product.quantity
        ? data.numInCart++
        : data.product.quantity;
      this.cardDataClient.prodData[index].Incart = data.numInCart;
      //Calculate total amount
      this.CalculateTotal();
      this.cardDataClient.total = this.cartDataServe.total;
      localStorage.setItem('cart', JSON.stringify(this.cardDataClient));
      this.cardData$.next({ ...this.cartDataServe });
    } else {
      data.numInCart--;

      if (data.numInCart < 1) {
        this.DeleteProductFromCart(index);

        this.cardData$.next({ ...this.cartDataServe });
      } else {
        this.cardData$.next({ ...this.cartDataServe });
        this.cardDataClient.prodData[index].Incart = data.numInCart;

        //Calculate total amount
        this.CalculateTotal();
        this.cardDataClient.total = this.cartDataServe.total;
        localStorage.setItem('cart', JSON.stringify(this.cardDataClient));
      }
    }
  }

  DeleteProductFromCart(index: number) {
    if (window.confirm('Are you sure you want to remove the item?')) {
      this.cartDataServe.data.splice(index, 1);
      this.cardDataClient.prodData.splice(index, 1);
      //calculate total amount
      this.CalculateTotal();
      this.cardDataClient.total = this.cartDataServe.total;

      if (this.cardDataClient.total == 0) {
        this.cardDataClient = {
          total: 0,
          prodData: [
            {
              Incart: 0,
              id: 0,
            },
          ],
        };

        localStorage.setItem('cart', JSON.stringify(this.cardDataClient));
      } else {
        localStorage.setItem('cart', JSON.stringify(this.cardDataClient));
      }

      if (this.cartDataServe.total == 0) {
        this.cartDataServe = {
          total: 0,
          data: [
            {
              numInCart: 0,
              product: { ...this.productEmpty },
            },
          ],
        };
        this.cardData$.next({ ...this.cartDataServe });
      } else {
        this.cardData$.next({ ...this.cartDataServe });
      }
    } else {
      return;
    }
  }

  CalculateSubTotal(index: number): number {
    let subTotal = 0;
    const p = this.cartDataServe.data[index];
    subTotal = p.product.price * p.numInCart;
    return subTotal;
  }

  private CalculateTotal() {
    let Total = 0;

    this.cartDataServe.data.forEach((p) => {
      const { numInCart } = p;
      const { price } = p.product;

      Total += numInCart * price;
    });

    this.cartDataServe.total = Total;
    this.cardTotal$.next(this.cartDataServe.total);
  }

  CheckoutFromCart(userId: number) {
    this.http
      .post<{ success: boolean }>(
        `${environment.server_url}/orders/payment`,
        null
      )
      .subscribe((res: { success: boolean }) => {
        if (res.success) {
          this.resetServerData();

          this.http
            .post<OrderResponse>(`${environment.server_url}/orders/new`, {
              userId: userId,
              products: this.cardDataClient.prodData,
            })
            .subscribe((data: OrderResponse) => {
              
              this.orderService
                .getSingleOrder(data.order_id)
                .subscribe((prods) => {
                  if (data.success) {
                    const navigationExtras: NavigationExtras = {
                      state: {
                        message: data.message,
                        products: prods,
                        orderId: data.order_id,
                        total: this.cardDataClient.total,
                      },
                    };
                    // hide Spinner
                    this.spinner.hide().then();

                    this.router
                      .navigate(['/thankyou'], navigationExtras)
                      .then((p) => {
                        this.cardDataClient = {
                          total: 0,
                          prodData: [
                            {
                              Incart: 0,
                              id: 0,
                            },
                          ],
                        };

                        this.cardTotal$.next(0);
                        localStorage.setItem(
                          'cart',
                          JSON.stringify(this.cardDataClient)
                        );
                      });
                  } else {
                    this.spinner.hide().then();
                    this.router.navigateByUrl('/checkout').then();

                    this.toast.error(
                      `Sorry, failed to book the order`,
                      'Order Status',
                      {
                        timeOut: 1500,
                        progressBar: true,
                        progressAnimation: 'increasing',
                        positionClass: 'toast-top-right',
                      }
                    );
                  }
                });
            });
        }
      });
  }

  private resetServerData() {
    this.cartDataServe = {
      total: 0,
      data: [
        {
          numInCart: 0,
          product: { ...this.productEmpty },
        },
      ],
    };

    this.cardData$.next({ ...this.cartDataServe });
  }
}

interface OrderResponse {
  order_id: number;
  success: boolean;
  message: string;
  products: [
    {
      id: string;
      numInCart: string;
    }
  ];
}
