import { inject, Injectable } from '@angular/core';
import {
  BoletaFilterFechas,
  BoletaFilterRequest,
  BoletaResponse,
  CarritoSave,
  DetalleBoletaResponse,
  VentaRequest,
} from '../domain/venta.interface';
import { BehaviorSubject, map, Observable } from 'rxjs';
import { environment } from 'src/environments/environment';
import { HttpClient } from '@angular/common/http';
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

  findAllFilter(): Observable<{ realizadas: number; total: number }> {
    return this.http.get<BoletaResponse[]>(`${this.baseUrl}/api/boleta`).pipe(
      map((ventas) => {
        const hoy = new Date().toISOString().split('T')[0]; // Fecha actual en YYYY-MM-DD

        const ventasHoy = ventas.filter((venta) => {
          const fechaVenta = new Date(venta.fechaEmision)
            .toISOString()
            .split('T')[0];
          return fechaVenta === hoy;
        });

        const totalVentas = ventasHoy.length;
        const totalIngresos = ventasHoy.reduce(
          (sum, venta) => sum + venta.total,
          0
        );

        return { realizadas: totalVentas, total: totalIngresos };
      })
    );
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
    filter: BoletaFilterRequest
  ): Observable<PaginatedResponse<BoletaResponse>> {
    const params = stringify(filter, { skipNulls: true });

    return this.http.get<PaginatedResponse<BoletaResponse>>(
      `${this.baseUrl}/api/boleta/paginated?${params}`
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
