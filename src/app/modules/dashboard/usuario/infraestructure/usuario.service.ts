import { PaginatedRequest } from '@/shared/page/page.request';
import { PaginatedResponse } from '@/shared/page/page.response';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';
import {
  UsuarioFilterRequest,
  UsuarioRequest,
  UsuarioResponse,
} from '../domain/usuario.interface';
import { HttpClient, HttpParams } from '@angular/common/http';
import { stringify } from 'qs';

@Injectable({
  providedIn: 'root',
})
export class UsuarioService {
  private baseUrl: string = environment.apiUrl;
  private http = inject(HttpClient);

  findAllPaginated(
    filter: UsuarioFilterRequest
  ): Observable<PaginatedResponse<UsuarioResponse>> {
    const params = stringify(filter, { skipNulls: true });

    return this.http.get<PaginatedResponse<UsuarioResponse>>(
      `${this.baseUrl}/api/usuario/paginated?${params}`
    );
  }

  findAll(): Observable<UsuarioResponse[]> {
    return this.http.get<UsuarioResponse[]>(`${this.baseUrl}/api/usuario`);
  }

  findById(id: number): Observable<UsuarioResponse> {
    return this.http.get<UsuarioResponse>(`${this.baseUrl}/api/usuario/${id}`);
  }

  create(data: UsuarioRequest): Observable<UsuarioResponse> {
    return this.http.post<UsuarioResponse>(`${this.baseUrl}/api/usuario`, data);
  }

  delete(id: number): Observable<UsuarioResponse> {
    return this.http.delete<UsuarioResponse>(
      `${this.baseUrl}/api/usuario/${id}`
    );
  }

  update(data: UsuarioRequest, id: number): Observable<UsuarioResponse> {
    return this.http.put<UsuarioResponse>(
      `${this.baseUrl}/api/usuario/${id}`,
      data
    );
  }
}
