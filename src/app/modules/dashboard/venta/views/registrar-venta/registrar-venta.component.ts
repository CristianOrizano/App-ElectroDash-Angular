import { ProductoResponse } from '@/modules/dashboard/producto/domain/producto.interface';
import { ProductoService } from '@/modules/dashboard/producto/infraestructure/producto.service';
import { PrimeModule } from '@/shared/prime/prime.module';
import { Component, inject } from '@angular/core';
import { AutoCompleteCompleteEvent } from 'primeng/autocomplete';
import {
  BehaviorSubject,
  debounceTime,
  map,
  Observable,
  Subject,
  switchMap,
} from 'rxjs';
import { VentaService } from '../../infraestructure/venta.service';
import {
  CarritoSave,
  DetalleVentaRequest,
  VentaRequest,
} from '../../domain/venta.interface';
import { urlproducto } from '@/core/constantes/constantes';
import { AuthService } from '@/modules/auth/infraestructure/auth.service';
import { LoginResponse } from '@/modules/auth/domain/auth.interface';
import {
  ClienteRequest,
  ClienteResponse,
} from '@/modules/dashboard/cliente/domain/cliente.interface';
import { ClienteService } from '@/modules/dashboard/cliente/infraestructure/cliente.service';
import { NotificationService } from '@/core/services/notification-service';

@Component({
  selector: 'app-registrar-venta',
  standalone: true,
  imports: [PrimeModule],
  templateUrl: './registrar-venta.component.html',
  styleUrl: './registrar-venta.component.css',
})
export class RegistrarVentaComponent {
  private productoService = inject(ProductoService);
  private carritoService = inject(VentaService);
  private authService = inject(AuthService);
  private clienteService = inject(ClienteService);
  private notification = inject(NotificationService);

  tipoVenta: string = 'Credito';
  products!: any[];

  productos: ProductoResponse[] = [];
  productosFiltrados: ProductoResponse[] = [];
  searchQuery = new Subject<string>();
  selectedProducto!: ProductoResponse | null;
  productoSave!: ProductoResponse;
  auth!: LoginResponse | null;
  visible: boolean = false;

  //cliente
  nombreCliente: string = '';
  clientes: ClienteResponse[] = [];
  clienteSave: ClienteResponse = {
    id: 0,
    nombre: '',
    apellido: '',
    telefono: 0,
    direccion: '',
    ndocumento: 0,
    state: false,
  };
  clientesFiltrados: ClienteResponse[] = []; // Lista filtrada

  //carrito
  montoPagado: number = 0; // Monto ingresado por el cliente
  cambio: number = 0; // Cambio a devolver
  descuentoOpciones = [0, 10, 15, 20]; // Opciones de descuento
  descuentoSeleccionado: number = 0; // Descuento por defecto
  descuentoAplicado = 0;
  fechaHoraActual: Date = new Date();
  carrito: CarritoSave[] = [];
  subTotal = 0;
  total = 0;
  stock: number = 0;
  cantidad: number = 1;
  urlProducto: string = urlproducto;
  private productosSubject = new BehaviorSubject<ProductoResponse[]>([]);

  ngOnInit(): void {
    // Suscribirse al input con debounce para evitar múltiples llamadas a la API
    this.searchQuery
      .pipe(
        debounceTime(300), // Espera 300ms después de que el usuario deje de escribir
        switchMap((query) => this.filtrarProductos(query))
      )
      .subscribe((resultados) => {
        this.productosFiltrados = resultados;
      });

    // Obtener todos los productos al iniciar
    this.productoService.findAll().subscribe((productos) => {
      this.productos = productos;
      this.productosSubject.next(productos); // Actualizar el BehaviorSubject con los productos obtenidos
    });

    this.carritoService.obtenerCarrito().subscribe((productos) => {
      this.carrito = productos;
      this.subTotal = this.carritoService.calcularTotal();
      this.total = this.carritoService.calcularTotal();
    });

    this.auth = this.authService.getAuthorization();

    this.clienteService.findAll().subscribe((data) => {
      this.clientes = data;
    });
  }
  showDialog() {
    this.visible = true;
  }

  filtrarProductos(query: string): Observable<ProductoResponse[]> {
    return this.productosSubject.pipe(
      map((productos) => {
        if (!query) {
          return [];
        }
        // Filtra los productos que coinciden con la consulta
        const productosFiltrados = productos.filter((p) =>
          p.descripcion.toLowerCase().includes(query.toLowerCase())
        );
        // Devuelve solo los primeros 10 productos que coinciden
        return productosFiltrados.slice(0, 10);
      })
    );
  }

  aplicarDescuento() {
    this.descuentoAplicado = (this.subTotal * this.descuentoSeleccionado) / 100;
    this.total = this.subTotal - this.descuentoAplicado;
  }

  onImageError(event: Event) {
    (event.target as HTMLImageElement).src = 'not-found.png';
  }

  calcularCambio() {
    if (this.montoPagado >= this.total) {
      this.cambio = this.montoPagado - this.total;
    } else {
      this.cambio = 0;
    }
  }

  onProductoSelect(event: any) {
    this.productoSave = event.value;
    this.stock = this.productoSave.stock;
  }

  eliminarProducto(id: number) {
    this.carritoService.eliminarProducto(id);
  }

  aumentarCantidad(id: number) {
    this.carritoService.aumentarCantidad(id);
    this.descuentoAplicado = 0;
  }

  disminuirCantidad(id: number) {
    this.carritoService.disminuirCantidad(id);
    this.descuentoAplicado = 0;
  }

  agregarProducto() {
    if (!this.productoSave || !this.productoSave.id) {
      return;
    }

    if (!this.cantidad || this.cantidad <= 0) {
      return;
    }
    const nuevoProducto: CarritoSave = {
      id: this.productoSave.id,
      nimagen: this.productoSave.nimagen,
      descripcion: this.productoSave.descripcion,
      precio: this.productoSave.precio,
      cantidad: this.cantidad,
      subTotal: this.productoSave.precio * this.cantidad,
    };
    this.carritoService.agregarProducto(nuevoProducto);
    this.selectedProducto = null;
    this.productoSave = {} as ProductoResponse;
    this.stock = 0;
    this.cantidad = 1;
  }
  //
  filtrarClientes(): void {
    if (!this.nombreCliente) {
      this.clientesFiltrados = [];
      return;
    }
    // Filtra los clientes que coincidan con el nombre y limita a 5 resultados
    this.clientesFiltrados = this.clientes
      .filter((cliente) =>
        cliente.nombre.toLowerCase().includes(this.nombreCliente.toLowerCase())
      )
      .slice(0, 5);
  }

  seleccionarCliente(cliente: ClienteResponse): void {
    this.clienteSave = cliente;
    this.visible = false;
  }

  guardarBoleta() {
    if (this.clienteSave.id === 0) {
      this.notification.showError('Error', `Debe Seleccionar un cliente`);
      return;
    }

    if (this.carrito.length === 0) {
      this.notification.showError(
        'Error',
        `Debe tener al menos un producto agregado`
      );
      return;
    }

    const detalles: DetalleVentaRequest[] = this.carrito.map((item) => ({
      idProducto: item.id,
      cantidad: item.cantidad,
    }));

    const boleta: VentaRequest = {
      fechaEmision: new Date().toISOString(),
      idCliente: this.clienteSave.id,
      idUsuario: this.auth?.usuario.id as number,
      tipoVenta: this.tipoVenta,
      total: this.total,
      detalles: detalles,
    };

    this.carritoService.generarBoleta(boleta).subscribe({
      next: () => {
        this.notification.showSuccess('Correcto', `Éxito al guardar`);
        this.cancelarCompra();
      },
      error: (error) => {
        console.error('Error al generar boleta:', error);
      },
    });
  }

  cancelarCompra() {
    this.carritoService.vaciarCarrito();
    this.clienteSave = {
      id: 0,
      nombre: '',
      apellido: '',
      telefono: 0,
      direccion: '',
      ndocumento: 0,
      state: false,
    };
    this.selectedProducto = null;
    this.productoSave = {} as ProductoResponse;
    this.stock = 0;
    this.cantidad = 1;
  }
}
