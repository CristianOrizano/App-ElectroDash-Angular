import { PaginatedRequest } from '@/shared/page/page.request';
import { PaginatedResponse } from '@/shared/page/page.response';
import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';
import {
  ProductoRequest,
  ProductoResponse,
} from '../domain/producto.interface';

@Injectable({
  providedIn: 'root',
})
export class ProductoService {
  private baseUrl: string = environment.apiUrl;
  private http = inject(HttpClient);

  findAllPaginated(
    filter: PaginatedRequest
  ): Observable<PaginatedResponse<ProductoResponse>> {
    const params = new HttpParams()
      .set('page', filter.page.toString())
      .set('size', filter.size.toString())
      .set('sortBy', filter.sortBy)
      .set('sortDir', filter.sortDir);

    return this.http.get<PaginatedResponse<ProductoResponse>>(
      `${this.baseUrl}/api/producto/paginated`,
      { params }
    );
  }

  findAll(): Observable<ProductoResponse[]> {
    return this.http.get<ProductoResponse[]>(`${this.baseUrl}/api/producto`);
  }

  findById(id: number): Observable<ProductoResponse> {
    return this.http.get<ProductoResponse>(
      `${this.baseUrl}/api/producto/${id}`
    );
  }

  create(data: ProductoRequest): Observable<ProductoResponse> {
    return this.http.post<ProductoResponse>(
      `${this.baseUrl}/api/producto`,
      data
    );
  }

  delete(id: number): Observable<ProductoResponse> {
    return this.http.delete<ProductoResponse>(
      `${this.baseUrl}/api/producto/${id}`
    );
  }

  update(data: ProductoRequest, id: number): Observable<ProductoResponse> {
    return this.http.put<ProductoResponse>(
      `${this.baseUrl}/api/producto/${id}`,
      data
    );
  }
}
