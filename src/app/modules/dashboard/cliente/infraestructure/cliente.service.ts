import { PaginatedResponse } from '@/shared/page/page.response';
import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';
import { ClienteRequest, ClienteResponse } from '../domain/cliente.interface';
import { PaginatedRequest } from '@/shared/page/page.request';
import { Observable } from 'rxjs';
import { stringify } from 'qs';
import { CategoriaFilterRequest } from '../../categoria/domain/categoria.interface';

@Injectable({
  providedIn: 'root',
})
export class ClienteService {
  private baseUrl: string = environment.apiUrl;
  private http = inject(HttpClient);
  private cache = new Map<string, PaginatedResponse<ClienteResponse>>();

  findAllPaginated(
    filter: CategoriaFilterRequest
  ): Observable<PaginatedResponse<ClienteResponse>> {
    const params = stringify(filter, { skipNulls: true });

    return this.http.get<PaginatedResponse<ClienteResponse>>(
      `${this.baseUrl}/api/cliente/paginated?${params}`
    );
  }

  findAll(): Observable<ClienteResponse[]> {
    return this.http.get<ClienteResponse[]>(`${this.baseUrl}/api/cliente`);
  }

  findById(id: number): Observable<ClienteResponse> {
    return this.http.get<ClienteResponse>(`${this.baseUrl}/api/cliente/${id}`);
  }

  create(data: ClienteRequest): Observable<ClienteResponse> {
    return this.http.post<ClienteResponse>(`${this.baseUrl}/api/cliente`, data);
  }

  update(data: ClienteRequest, id: number): Observable<ClienteResponse> {
    return this.http.put<ClienteResponse>(
      `${this.baseUrl}/api/cliente/${id}`,
      data
    );
  }

  delete(id: number): Observable<ClienteResponse> {
    return this.http.delete<ClienteResponse>(
      `${this.baseUrl}/api/cliente/${id}`
    );
  }
}
