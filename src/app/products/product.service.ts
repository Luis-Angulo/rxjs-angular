import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import {
  BehaviorSubject,
  combineLatest,
  from,
  merge,
  Observable,
  Subject,
  throwError,
} from 'rxjs';
import { catchError, filter, map, mergeMap, scan, shareReplay, switchMap, tap, toArray } from 'rxjs/operators';

import { Product } from './product';
import { Supplier } from '../suppliers/supplier';
import { SupplierService } from '../suppliers/supplier.service';
import { ProductCategoryService } from '../product-categories/product-category.service';

@Injectable({
  providedIn: 'root',
})
export class ProductService {
  private productsUrl = 'api/products';
  private suppliersUrl = this.supplierService.suppliersUrl;
  products$ = this.http
    .get<Product[]>(this.productsUrl)
    .pipe(catchError(this.handleError));

  productsWithCategory$: Observable<Product[]> = combineLatest([
    this.products$,
    this.productCategoryService.productCategories$,
  ]).pipe(
    tap((data) => console.log('products', JSON.stringify(data))),
    map(([products, categories]) =>
      products.map(p => ({
            ...p,
            price: p.price * 1.5,
            category: categories.find(cat => p.categoryId === cat.id).name,
            searchKey: [p.productName],
          } as Product))
    ),
    shareReplay(1) // Cached emission
  );

  private productSelectedSubject = new BehaviorSubject<number>(0);
  productSelectedAction$ = this.productSelectedSubject.asObservable();

  selectedProduct$ = combineLatest([
    this.productsWithCategory$,
    this.productSelectedAction$,
  ]).pipe(
    map(([products, productId]) => products.find((p) => p.id === productId)),
    shareReplay(1) // Cached emission
  );

  selectedProductSuppliers$ = this.selectedProduct$.pipe(
    filter(product => !!product),  // skip if the product is falsy
    // mergeMap(product => from(product.supplierIds)  // would cause the wrong data to render if the user clicks fast on many menu items
    switchMap(product => from(product.supplierIds)  // ignore all events but latest
    .pipe(
      mergeMap(supplierId => this.http.get<Supplier>(`${this.suppliersUrl}/${supplierId}`)),
      toArray(), // waits for all observables to finish
      tap(val => console.log('sps value', val))
    )
  ));

  private productInsertedSubject = new Subject<Product>();
  productInsertedAction$ = this.productInsertedSubject.asObservable();

  productsWithAdd$ = merge(
    this.productsWithCategory$,
    this.productInsertedAction$
  ).pipe(scan((acc: Product[], value: Product) => [...acc, value]));

  constructor(
    private http: HttpClient,
    private supplierService: SupplierService,
    private productCategoryService: ProductCategoryService
  ) {}

  selectProduct(productId: number): void {
    this.productSelectedSubject.next(productId);
  }

  addProduct(newProduct?: Product): void {
    newProduct = newProduct || this.fakeProduct();
    this.productInsertedSubject.next(newProduct);
  }

  private fakeProduct(): Product {
    return {
      id: 42,
      productName: 'Another One',
      productCode: 'TBX-0042',
      description: 'Our new product',
      price: 8.9,
      categoryId: 3,
      quantityInStock: 30,
    };
  }

  private handleError(err: any): Observable<never> {
    let errorMessage: string;
    if (err.error instanceof ErrorEvent) {
      errorMessage = `An error occurred: ${err.error.message}`;
    } else {
      errorMessage = `Backend returned code ${err.status}: ${err.body.error}`;
    }
    console.error(err);
    return throwError(errorMessage);
  }
}
