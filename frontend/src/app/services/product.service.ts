import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';
import { ProductModelServer, ServerResponse } from '../models/product.model';

@Injectable({
  providedIn: 'root',
})
export class ProductService {
  constructor(private http: HttpClient) {}

  /* Get all product from backend*/
  getAllProduct(numberOfResults: number = 10): Observable<ServerResponse> {
    return this.http.get<ServerResponse>(environment.server_url + '/products', {
      params: {
        limit: numberOfResults.toString(),
      },
    });
  }

  /* Get Single product*/
  getSingleProduct(id: number): Observable<ProductModelServer> {
    return this.http.get<ProductModelServer>(
      environment.server_url + '/products/' + id
    );
  }

  /* Get products from one category */
  getProductsFromCategory(catName: string): Observable<ProductModelServer> {
    return this.http.get<ProductModelServer>(
      environment.server_url + '/products/category/' + catName
    );
  }
}
