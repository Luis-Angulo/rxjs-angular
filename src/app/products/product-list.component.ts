import { ChangeDetectionStrategy, Component } from '@angular/core';

import { BehaviorSubject, combineLatest, EMPTY, Subject } from 'rxjs';
import { catchError, map, tap } from 'rxjs/operators';
import { ProductCategoryService } from '../product-categories/product-category.service';
import { Product } from './product';
import { ProductService } from './product.service';

@Component({
  templateUrl: './product-list.component.html',
  styleUrls: ['./product-list.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProductListComponent {
  pageTitle = 'Product List';
  errorMessage = '';

  private categorySelectedSubject = new BehaviorSubject<number>(0);
  // private categorySelectedSubject = new Subject<number>();  // this would not emit anything at first
  categorySelectedAction$ = this.categorySelectedSubject.asObservable();

  // declarative style
  products$ = combineLatest([
    this.productService.productsWithCategory$,
    this.categorySelectedAction$,
  ]).pipe(
    map(([products, selectedCategoryId]) =>
      // return all if no catId, else filter by it
      products.filter((p: Product) =>
        selectedCategoryId ? p.categoryId === selectedCategoryId : true
      )
    ),
    catchError((err) => {
      this.errorMessage = err;
      return EMPTY;
    })
  );

  categories$ = this.productCategoryService.productCategories$.pipe(
    catchError((err) => {
      this.errorMessage = err;
      return EMPTY;
    })
  );

  constructor(
    private productService: ProductService,
    private productCategoryService: ProductCategoryService
  ) {}

  onAdd(): void {
    console.log('Not yet implemented');
  }

  onSelected(categoryId: string): void {
    this.categorySelectedSubject.next(+categoryId);
  }
}
