import { Component, inject, OnInit } from '@angular/core';
import { PrimeModule } from '../../../shared/prime/prime.module';
import { VentaService } from '../venta/infraestructure/venta.service';
import { BoletaResponse } from '../venta/domain/venta.interface';
import { ProductoService } from '../producto/infraestructure/producto.service';
import { CategoriaService } from '../categoria/infraestructure/categoria.service';
import { ClienteService } from '../cliente/infraestructure/cliente.service';
import { UsuarioService } from '../usuario/infraestructure/usuario.service';
import { MarcaService } from '../marca/infraestructure/marca.service';
import { AuthService } from '@/modules/auth/infraestructure/auth.service';
import { LoginResponse } from '@/modules/auth/domain/auth.interface';
import { urlproducto } from '@/core/constantes/constantes';
import { ProductoResponse } from '../producto/domain/producto.interface';
import jsPDF from 'jspdf';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [PrimeModule],
  templateUrl: './home.component.html',
  styleUrl: './home.component.css',
})
export class HomeComponent implements OnInit {
  private ventaService = inject(VentaService);
  private productoService = inject(ProductoService);
  private categoriaService = inject(CategoriaService);
  private clienteService = inject(ClienteService);
  private usuarioService = inject(UsuarioService);
  private marcaService = inject(MarcaService);
  private authService = inject(AuthService);

  productosConDescuento: ProductoResponse[] = [];
  urlProducto: string = urlproducto;
  isUser: boolean = false;
  auth!: LoginResponse | null;
  totalClientes: number = 0;
  totalProductos: number = 0;
  totalCategorias: number = 0;
  totalUsuarios: number = 0;
  totalMarcas: number = 0;
  ventasRealizadas: number = 0;
  totalVentas: number = 0;
  basicData: any;
  basicOptions: any;
  dataVentas: BoletaResponse[] = [];
  pieData: any;
  // Array con los nombres de los meses en español
  private nombresMeses: any = [
    'Enero',
    'Febrero',
    'Marzo',
    'Abril',
    'Mayo',
    'Junio',
    'Julio',
    'Agosto',
    'Septiembre',
    'Octubre',
    'Noviembre',
    'Diciembre',
  ];

  ngOnInit() {
    this.auth = this.authService.getAuthorization();

    if (this.auth && this.auth.usuario.roles) {
      const roles = this.auth.usuario.roles.map((role) => role.nombre);

      // Verifica si el usuario tiene solo el rol "User" y no "Admin"
      this.isUser = roles.includes('User') && !roles.includes('Admin');
    }

    this.ventaService.findAll().subscribe((ventas) => {
      this.dataVentas = ventas;
      // Procesar los datos después de que se hayan cargado
      const ventasPorMes = this.agruparVentasPorMes(this.dataVentas);
      this.basicData = this.prepararDatosParaGrafico(ventasPorMes);
      this.basicOptions = this.getChartOptions();
      // Generar datos para el gráfico de pastel
      this.pieData = this.prepararDatosParaPie(this.dataVentas);
    });

    this.getListCliente();
    this.getListCategorias();
    this.getListProductos();
    this.getVentasDelDia();
    this.getListUsuarios();
    this.getListMarcas();
  }

  getVentasDelDia() {
    this.ventaService.findAllFilter().subscribe({
      next: (response) => {
        this.ventasRealizadas = response.realizadas;
        this.totalVentas = response.total;
      },
      error: (err) => {
        console.error('Error al guardar:', err);
      },
    });
  }

  getListCliente() {
    this.clienteService.findAll().subscribe({
      next: (data) => {
        this.totalClientes = data.length;
      },
      error: (error) => {
        console.log('error en : ' + error);
      },
    });
  }

  getListUsuarios() {
    this.usuarioService.findAll().subscribe({
      next: (data) => {
        this.totalUsuarios = data.length;
      },
      error: (error) => {
        console.log('error en : ' + error);
      },
    });
  }

  getListMarcas() {
    this.marcaService.findAll().subscribe({
      next: (data) => {
        this.totalMarcas = data.length;
      },
      error: (error) => {
        console.log('error en : ' + error);
      },
    });
  }

  getListCategorias() {
    this.categoriaService.findAll().subscribe({
      next: (data) => {
        this.totalCategorias = data.length;
      },
      error: (error) => {
        console.log('error en : ' + error);
      },
    });
  }

  getListProductos() {
    this.productoService.findAll().subscribe({
      next: (data) => {
        this.totalProductos = data.length;
        this.productosConDescuento = data.filter(
          (producto) => producto.descuento > 0
        );
      },
      error: (error) => {
        console.log('error en : ' + error);
      },
    });
  }

  prepararDatosParaPie(ventas: BoletaResponse[]) {
    // Agrupar ventas por tipo (ejemplo: "Contado" y "Crédito")
    const ventasPorTipo = ventas.reduce((acumulador, venta) => {
      const tipo = venta.tipoVenta || 'Desconocido'; // Asegurar que siempre tenga un valor
      acumulador[tipo] = (acumulador[tipo] || 0) + venta.total;
      return acumulador;
    }, {} as Record<string, number>);

    return {
      labels: Object.keys(ventasPorTipo), // ["Contado", "Crédito"]
      datasets: [
        {
          data: Object.values(ventasPorTipo), // [Total Contado, Total Crédito]
          backgroundColor: ['#FF6384', '#36A2EB'], // Colores del gráfico
          hoverBackgroundColor: ['#FF6384', '#36A2EB'], // Colores al pasar el mouse
        },
      ],
    };
  }
  onImageError(event: Event) {
    (event.target as HTMLImageElement).src = 'not-found.png';
  }

  // Agrupa las ventas solo del año actual por mes
  agruparVentasPorMes(ventas: BoletaResponse[]): { [key: string]: number } {
    const añoActual = new Date().getFullYear(); // Obtiene el año actual

    return ventas.reduce((acumulador: any, venta) => {
      const fecha = new Date(venta.fechaEmision);
      const añoVenta = fecha.getFullYear(); // Año de la venta
      const mes = fecha.getMonth(); // Obtiene el número del mes (0 = enero, 11 = diciembre)
      const nombreMes = this.nombresMeses[mes]; // Obtiene el nombre del mes

      // Solo incluir ventas del año actual
      if (añoVenta === añoActual) {
        if (!acumulador[nombreMes]) {
          acumulador[nombreMes] = 0;
        }
        acumulador[nombreMes] += venta.total;
      }

      return acumulador;
    }, {});
  }

  // Prepara los datos para el gráfico
  prepararDatosParaGrafico(ventasPorMes: { [key: string]: number }) {
    const meses = this.nombresMeses; // Lista de todos los meses en orden
    const montos = meses.map((mes: any) => ventasPorMes[mes] || 0); // Asegurar valores para cada mes

    return {
      labels: meses, // Eje X: Meses
      datasets: [
        {
          label: `Ventas ${new Date().getFullYear()}`, // Año actual
          data: montos, // Eje Y: Montos
          backgroundColor: 'rgba(75, 192, 192, 0.2)', // Color de fondo de las barras
          borderColor: 'rgb(75, 192, 192)', // Color del borde de las barras
          borderWidth: 1,
        },
      ],
    };
  }

  // Opciones del gráfico
  getChartOptions() {
    const documentStyle = getComputedStyle(document.documentElement);
    const textColor = documentStyle.getPropertyValue('--text-color');
    const textColorSecondary = documentStyle.getPropertyValue(
      '--text-color-secondary'
    );
    const surfaceBorder = documentStyle.getPropertyValue('--surface-border');

    return {
      plugins: {
        legend: {
          labels: {
            color: textColor,
          },
        },
      },
      scales: {
        y: {
          beginAtZero: true,
          ticks: {
            color: textColorSecondary,
          },
          grid: {
            color: surfaceBorder,
            drawBorder: false,
          },
        },
        x: {
          ticks: {
            color: textColorSecondary,
          },
          grid: {
            color: surfaceBorder,
            drawBorder: false,
          },
        },
      },
    };
  }

  generarPDF() {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.width;
    const pageHeight = doc.internal.pageSize.height;

    // Fondo gris claro para la página
    doc.setFillColor(230, 230, 230);
    doc.rect(0, 0, pageWidth, pageHeight, 'F');

    let x = 10,
      y = 10; // Posiciones iniciales
    const cardWidth = 90;
    const cardHeight = 120;
    const imgWidth = 70;
    const imgHeight = 45;

    this.productosConDescuento.forEach((producto, index) => {
      if (y + cardHeight > pageHeight - 10) {
        doc.addPage();
        doc.setFillColor(230, 230, 230);
        doc.rect(0, 0, pageWidth, pageHeight, 'F');
        x = 10;
        y = 10;
      }

      // Fondo gris para la tarjeta del producto
      doc.setFillColor(255, 255, 255);
      doc.roundedRect(x, y, cardWidth, cardHeight, 5, 5, 'F');

      // Imagen del producto
      const imageUrl = producto.nimagen
        ? `${this.urlProducto}${producto.nimagen}`
        : 'not-found.png';
      doc.addImage(imageUrl, 'JPEG', x + 10, y + 5, imgWidth, imgHeight);

      // Marca del producto
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(10);
      doc.setTextColor(0, 0, 0);
      doc.text(producto.marca.nombre, x + 5, y + imgHeight + 15);

      // Descripción del producto
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8);
      doc.text(producto.descripcion, x + 5, y + imgHeight + 25, {
        maxWidth: cardWidth - 10,
      });

      // Precio original calculado
      const precioOriginal =
        producto.descuento > 0
          ? (producto.precio / (1 - producto.descuento / 100)).toFixed(2)
          : producto.precio.toFixed(2);

      // Precio original (tachado en gris)
      doc.setFont('helvetica', 'italic');
      doc.setFontSize(9);
      doc.setTextColor(100, 100, 100);
      const precioOriginalX = x + 5;
      const precioOriginalY = y + imgHeight + 40;
      doc.text(`S/ ${precioOriginal}`, precioOriginalX, precioOriginalY);
      doc.setDrawColor(100, 100, 100);
      doc.line(
        precioOriginalX,
        precioOriginalY - 2,
        precioOriginalX + 25,
        precioOriginalY - 2
      );

      // Precio con descuento (en rojo, más grande)
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(12);
      doc.setTextColor(255, 0, 0);
      doc.text(`S/ ${producto.precio.toFixed(2)}`, x + 5, y + imgHeight + 50);

      // Ajustar posición para la siguiente tarjeta
      x += cardWidth + 10;
      if ((index + 1) % 2 === 0) {
        x = 10;
        y += cardHeight + 10;
      }
    });

    // Guardar el PDF
    doc.save('reporte_productos.pdf');
  }
}
