import { Component } from '@angular/core';

import { ProductService } from '../product.service';

@Component({
  selector: 'pm-product-detail',
  templateUrl: './product-detail.component.html'
})
export class ProductDetailComponent {
  pageTitle = 'Product Detail';
  errorMessage = '';
  productSuppliers = null;  // no idea why it suddenly started asking for this
  product;

  constructor(private productService: ProductService) { }

}
