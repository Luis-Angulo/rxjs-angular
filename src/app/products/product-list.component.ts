import { ChangeDetectionStrategy, Component } from '@angular/core';

import { EMPTY } from 'rxjs';
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
  categories;
  selectedCategoryId = 1;

  productsSimpleFilter$ = this.productService.productsWithCategory$.pipe(
    map((products: Product[]) =>
      products.filter((p) =>
        // if there's no id to filterBy, return every product
        this.selectedCategoryId
          ? p.categoryId === this.selectedCategoryId
          : true
      )
    ),
    tap(console.log)
  );

  // declarative style
  products$ = this.productService.productsWithCategory$.pipe(
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
    this.selectedCategoryId = +categoryId;
  }
}
