import { inject, Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, of, tap } from 'rxjs';
import {
  CategoriaFilterRequest,
  CategoriaRequest,
  CategoriaResponse,
} from '../domain/categoria.interface';
import { environment } from 'src/environments/environment';
import { PaginatedResponse } from '@/shared/page/page.response';
import { PaginatedRequest } from '@/shared/page/page.request';
import { stringify } from 'qs';

@Injectable({
  providedIn: 'root',
})
export class CategoriaService {
  private baseUrl: string = environment.apiUrl;
  private http = inject(HttpClient);
  private cache = new Map<string, PaginatedResponse<CategoriaResponse>>();

  findAllPaginated(
    filter: CategoriaFilterRequest
  ): Observable<PaginatedResponse<CategoriaResponse>> {
    const params = stringify(filter, { skipNulls: true });

    return this.http.get<PaginatedResponse<CategoriaResponse>>(
      `${this.baseUrl}/api/categoria/paginated?${params}`
    );
  }

  /*findAllPaginated(
    filter: PaginatedRequest
  ): Observable<PaginatedResponse<CategoriaResponse>> {
    const cacheKey = `page=${filter.page}&size=${filter.size}&sortBy=${filter.sortBy}&sortDir=${filter.sortDir}`;

    if (this.cache.has(cacheKey)) {
      return of(this.cache.get(cacheKey)!);
    }
    const params = new HttpParams()
      .set('page', filter.page.toString())
      .set('size', filter.size.toString())
      .set('sortBy', filter.sortBy)
      .set('sortDir', filter.sortDir);

    return this.http
      .get<PaginatedResponse<CategoriaResponse>>(
        `${this.baseUrl}/api/categoria/paginated`,
        { params }
      )
      .pipe(tap((data) => this.cache.set(cacheKey, data)));
  } */

  findAll(): Observable<CategoriaResponse[]> {
    return this.http.get<CategoriaResponse[]>(`${this.baseUrl}/api/categoria`);
  }

  findById(id: number): Observable<CategoriaResponse> {
    return this.http.get<CategoriaResponse>(
      `${this.baseUrl}/api/categoria/${id}`
    );
  }

  create(data: CategoriaRequest): Observable<CategoriaResponse> {
    return this.http.post<CategoriaResponse>(
      `${this.baseUrl}/api/categoria`,
      data
    );
  }

  delete(id: number): Observable<CategoriaResponse> {
    return this.http.delete<CategoriaResponse>(
      `${this.baseUrl}/api/categoria/${id}`
    );
  }
  update(data: CategoriaRequest, id: number): Observable<CategoriaResponse> {
    return this.http.put<CategoriaResponse>(
      `${this.baseUrl}/api/categoria/${id}`,
      data
    );
  }

  /*update(data: CategoriaRequest, id: number): Observable<CategoriaResponse> {
    return this.http
      .put<CategoriaResponse>(`${this.baseUrl}/api/categoria/${id}`, data)
      .pipe(tap(() => this.invalidateCache()));
  } */

  private invalidateCache(): void {
    this.cache.clear();
  }
}
