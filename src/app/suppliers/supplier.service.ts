import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { throwError, Observable, of } from 'rxjs';
import { concatMap, map, mergeMap, switchMap, tap } from 'rxjs/operators';
import { Supplier } from './supplier';

// This isn't used in the GUI, it's just here to show different higher order mapping operators

@Injectable({
  providedIn: 'root',
})
export class SupplierService {
  suppliersUrl = 'api/suppliers';

  // higher order observable
  suppliersWithMap$ = of(1, 5, 8).pipe(
    map((id) => this.http.get<Supplier>(`${this.suppliersUrl}/${id}`))
  );

  // higher order observable
  suppliersWithConcatMap$ = of(1, 5, 8).pipe(
    tap((id) => console.log('concatmap source', id)),
    concatMap((id) => this.http.get<Supplier>(`${this.suppliersUrl}/${id}`))
  );

  // higher order observable
  suppliersWithMergeMap$ = of(1, 5, 8).pipe(
    tap((id) => console.log('mergemap source', id)),
    mergeMap((id) => this.http.get<Supplier>(`${this.suppliersUrl}/${id}`))
  );

  // higher order observable
  suppliersWithSwitchMap$ = of(1, 5, 8).pipe(
    tap((id) => console.log('switchmap source', id)),
    switchMap((id) => this.http.get<Supplier>(`${this.suppliersUrl}/${id}`))
  );

  constructor(private http: HttpClient) {
    // this.suppliersWithMap$.subscribe((o) => o.subscribe(console.log));  // requires sub to dig to obs
    // This is sequential, it'll take longer to be done
    // higher order obs dont require drilling down to the inner obs
    /*
    this.suppliersWithConcatMap$.subscribe((item) =>
      console.log('concatMap', item)
    );
    // this is parallel, it will finish ASAP BUT not necessarily in order
    this.suppliersWithMergeMap$.subscribe((item) =>
      console.log('mergeMap', item)
    );
    // this will only get the LAST emission
    this.suppliersWithSwitchMap$.subscribe((item) =>
      console.log('switchMap', item)
    );
    */
  }

  private handleError(err: any): Observable<never> {
    // in a real world app, we may send the server to some remote logging infrastructure
    // instead of just logging it to the console
    let errorMessage: string;
    if (err.error instanceof ErrorEvent) {
      // A client-side or network error occurred. Handle it accordingly.
      errorMessage = `An error occurred: ${err.error.message}`;
    } else {
      // The backend returned an unsuccessful response code.
      // The response body may contain clues as to what went wrong,
      errorMessage = `Backend returned code ${err.status}: ${err.body.error}`;
    }
    console.error(err);
    return throwError(errorMessage);
  }
}
