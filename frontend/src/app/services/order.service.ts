import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root',
})
export class OrderService {
  products: any[] = [];

  constructor(private http: HttpClient) {}

  /* Get single order */
  getSingleOrder(orderId: number): Observable<ProductResponseModel> {
    return this.http.get<ProductResponseModel>(
      environment.server_url + '/orders/' + orderId
    );
  }
}

interface ProductResponseModel {
  id: number;
  title: string;
  description: string;
  price: number;
  quantityOrdered: number;
  image: string;
}
