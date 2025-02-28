import { inject, Injectable } from '@angular/core';
import {
  BoletaFilterFechas,
  BoletaResponse,
  CarritoSave,
  DetalleBoletaResponse,
  VentaRequest,
} from '../domain/venta.interface';
import { BehaviorSubject, Observable } from 'rxjs';
import { environment } from 'src/environments/environment';
import { HttpClient, HttpParams } from '@angular/common/http';
import { PaginatedRequest } from '@/shared/page/page.request';
import { PaginatedResponse } from '@/shared/page/page.response';
import { stringify } from 'qs';

@Injectable({
  providedIn: 'root',
})
export class VentaService {
  private carrito: CarritoSave[] = [];
  private carritoSubject = new BehaviorSubject<CarritoSave[]>([]);
  private baseUrl: string = environment.apiUrl;
  private http = inject(HttpClient);

  constructor() {
    this.cargarCarrito();
  }

  generarBoleta(data: VentaRequest): Observable<string> {
    return this.http.post<string>(`${this.baseUrl}/api/boleta/guardar`, data);
  }

  findAll(): Observable<BoletaResponse[]> {
    return this.http.get<BoletaResponse[]>(`${this.baseUrl}/api/boleta`);
  }

  findByFilterDates(
    filterFechas: BoletaFilterFechas
  ): Observable<BoletaResponse[]> {
    const params = stringify(filterFechas, { skipNulls: true });

    return this.http.get<BoletaResponse[]>(
      `${this.baseUrl}/api/boleta/filtrar?${params}`
    );
  }

  findByIdDetalleBoleta(id: number): Observable<DetalleBoletaResponse[]> {
    return this.http.get<DetalleBoletaResponse[]>(
      `${this.baseUrl}/api/detalleboleta/buscarporidboleta/${id}`
    );
  }

  findAllPaginated(
    filter: PaginatedRequest
  ): Observable<PaginatedResponse<BoletaResponse>> {
    const params = new HttpParams()
      .set('page', filter.page.toString())
      .set('size', filter.size.toString())
      .set('sortBy', filter.sortBy)
      .set('sortDir', filter.sortDir);

    return this.http.get<PaginatedResponse<BoletaResponse>>(
      `${this.baseUrl}/api/boleta/paginated`,
      { params }
    );
  }

  private guardarCarrito() {
    localStorage.setItem('carrito', JSON.stringify(this.carrito));
    this.carritoSubject.next([...this.carrito]); // Notificar cambios
  }

  private cargarCarrito() {
    const carritoGuardado = localStorage.getItem('carrito');
    if (carritoGuardado) {
      this.carrito = JSON.parse(carritoGuardado);
      this.carritoSubject.next(this.carrito);
    }
  }

  obtenerCarrito() {
    return this.carritoSubject.asObservable();
  }

  agregarProducto(producto: CarritoSave) {
    const index = this.carrito.findIndex((p) => p.id === producto.id);
    if (index === -1) {
      // Solo agrega el producto si no existe en el carrito
      this.carrito.push({
        ...producto,
        subTotal: producto.precio * producto.cantidad,
      });
      this.guardarCarrito();
    }
  }

  eliminarProducto(id: number) {
    this.carrito = this.carrito.filter((p) => p.id !== id);
    this.guardarCarrito();
  }

  aumentarCantidad(id: number) {
    const producto = this.carrito.find((p) => p.id === id);
    if (producto) {
      producto.cantidad++;
      producto.subTotal = producto.cantidad * producto.precio;
      this.guardarCarrito();
    }
  }

  disminuirCantidad(id: number) {
    const producto = this.carrito.find((p) => p.id === id);
    if (producto && producto.cantidad > 1) {
      producto.cantidad--;
      producto.subTotal = producto.cantidad * producto.precio;
      this.guardarCarrito();
    } else {
      this.eliminarProducto(id);
    }
  }

  vaciarCarrito() {
    this.carrito = [];
    this.guardarCarrito();
  }

  calcularTotal(): number {
    return this.carrito.reduce((total, p) => total + p.subTotal, 0);
  }
}
