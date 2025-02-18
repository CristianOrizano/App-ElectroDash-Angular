import { inject, Injectable } from '@angular/core';
import { CarritoSave, VentaRequest } from '../domain/venta.interface';
import { BehaviorSubject, Observable } from 'rxjs';
import { environment } from 'src/environments/environment';
import { HttpClient } from '@angular/common/http';

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
