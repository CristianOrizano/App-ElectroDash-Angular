import { PaginatedResponse } from '@/shared/page/page.response';
import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';
import {
  MarcaFilterRequest,
  MarcaRequest,
  MarcaResponse,
} from '../domain/marca.interface';
import { PaginatedRequest } from '@/shared/page/page.request';
import { Observable } from 'rxjs';
import { stringify } from 'qs';

@Injectable({
  providedIn: 'root',
})
export class MarcaService {
  private baseUrl: string = environment.apiUrl;
  private http = inject(HttpClient);

  findAllPaginated(
    filter: MarcaFilterRequest
  ): Observable<PaginatedResponse<MarcaResponse>> {
    const params = stringify(filter, { skipNulls: true });

    return this.http.get<PaginatedResponse<MarcaResponse>>(
      `${this.baseUrl}/api/marca/paginated?${params}`
    );
  }

  findAll(): Observable<MarcaResponse[]> {
    return this.http.get<MarcaResponse[]>(`${this.baseUrl}/api/marca`);
  }

  findById(id: number): Observable<MarcaResponse> {
    return this.http.get<MarcaResponse>(`${this.baseUrl}/api/marca/${id}`);
  }

  create(data: MarcaRequest): Observable<MarcaResponse> {
    return this.http.post<MarcaResponse>(`${this.baseUrl}/api/marca`, data);
  }

  delete(id: number): Observable<MarcaResponse> {
    return this.http.delete<MarcaResponse>(`${this.baseUrl}/api/marca/${id}`);
  }
  update(data: MarcaRequest, id: number): Observable<MarcaResponse> {
    return this.http.put<MarcaResponse>(
      `${this.baseUrl}/api/marca/${id}`,
      data
    );
  }
}
