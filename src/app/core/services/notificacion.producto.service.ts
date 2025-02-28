import { ProductoResponse } from '@/modules/dashboard/producto/domain/producto.interface';
import { BoletaResponse } from '@/modules/dashboard/venta/domain/venta.interface';
import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { environment } from 'src/environments/environment';

export interface NotificacionResponse {
  id: number;
  mensaje: string;
  state: Boolean;
  fecha: string;
  producto: ProductoResponse;
}

@Injectable({
  providedIn: 'root',
})
export class NotificacionProductoService {
  private baseUrl: string = environment.apiUrl;
  private http = inject(HttpClient);

  private notificacionesSubject = new BehaviorSubject<NotificacionResponse[]>(
    []
  );
  notificaciones$ = this.notificacionesSubject.asObservable();

  findAll(): Observable<NotificacionResponse[]> {
    return this.http.get<NotificacionResponse[]>(
      `${this.baseUrl}/api/notificacion`
    );
  }

  findAllNotificacion(): void {
    this.http
      .get<NotificacionResponse[]>(`${this.baseUrl}/api/notificacion`)
      .subscribe((data) => {
        this.notificacionesSubject.next(data);
      });
  }

  delete(id: number): Observable<NotificacionResponse> {
    return this.http.delete<NotificacionResponse>(
      `${this.baseUrl}/api/notificacion/${id}`
    );
  }
}
