import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { catchError } from 'rxjs/operators';

export interface LookupEntry {
  id: string;
  sequence: string;
}

@Injectable({
  providedIn: 'root',
})
export class DataService {
  private http = inject(HttpClient);

  getLookupData(): Observable<LookupEntry[]> {
    return this.http.get<LookupEntry[]>('data/lookup.json').pipe(
      catchError((error) => {
        console.error('Error fetching lookup data:', error);
        return of([]);
      })
    );
  }
}
