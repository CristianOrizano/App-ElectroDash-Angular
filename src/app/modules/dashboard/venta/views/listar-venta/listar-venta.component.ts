import { Component, inject } from '@angular/core';
import { VentaService } from '../../infraestructure/venta.service';
import { PrimeNGConfig } from 'primeng/api';

import {
  BoletaFilterRequest,
  BoletaResponse,
  DetalleBoletaResponse,
} from '../../domain/venta.interface';
import { PrimeModule } from '@/shared/prime/prime.module';
import { SkeletonComponent } from '../../../../../shared/skeleton/skeleton.component';
import { urlproducto, urlusuario } from '@/core/constantes/constantes';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { AuthService } from '@/modules/auth/infraestructure/auth.service';
import { LoginResponse } from '@/modules/auth/domain/auth.interface';
import { PrecioDescuentoPipe } from '@/core/pipes/precio-descuento.pipe';

@Component({
  selector: 'app-listar-venta',
  standalone: true,
  imports: [PrimeModule, SkeletonComponent, PrecioDescuentoPipe],
  templateUrl: './listar-venta.component.html',
  styleUrl: './listar-venta.component.css',
})
export class ListarVentaComponent {
  private ventasService = inject(VentaService);
  private authService = inject(AuthService);

  urlProducto: string = urlproducto;
  visible: boolean = false;
  detalleBoleta!: DetalleBoletaResponse[];
  totalPagado!: number;
  saveBoleta?: BoletaResponse;
  subtotal!: number;
  urlUsuario: string = urlusuario;
  isLoading: boolean = true;
  dataBoleta!: BoletaResponse[];
  totalElements!: number;
  boletaFilter: BoletaFilterRequest = {
    page: 1,
    size: 10,
    sortBy: 'id',
    sortDir: 'desc',
  };
  fechaInicio: Date | null = null;
  fechaFin: Date | null = null;
  tipoVenta: string | null = null;

  tiposVenta = [
    { nombre: 'Contado', valor: 'Contado' },
    { nombre: 'Credito', valor: 'Credito' },
  ];
  auth?: LoginResponse | null;
  constructor(private primeNGConfig: PrimeNGConfig) {}
  ngOnInit() {
    this.auth = this.authService.getAuthorization();

    if (this.auth) {
      const esAdmin = this.auth.usuario.roles.some(
        (rol) => rol.nombre === 'Admin'
      );

      if (!esAdmin) {
        this.boletaFilter.idUsuario = this.auth.usuario.id; // Filtra solo por el usuario
      }
    }

    this.loadVentas();
    this.primeNGConfig.setTranslation({
      firstDayOfWeek: 1,
      dayNames: [
        'domingo',
        'lunes',
        'martes',
        'miércoles',
        'jueves',
        'viernes',
        'sábado',
      ],
      dayNamesShort: ['dom', 'lun', 'mar', 'mié', 'jue', 'vie', 'sáb'],
      dayNamesMin: ['D', 'L', 'M', 'X', 'J', 'V', 'S'],
      monthNames: [
        'enero',
        'febrero',
        'marzo',
        'abril',
        'mayo',
        'junio',
        'julio',
        'agosto',
        'septiembre',
        'octubre',
        'noviembre',
        'diciembre',
      ],
      monthNamesShort: [
        'ene',
        'feb',
        'mar',
        'abr',
        'may',
        'jun',
        'jul',
        'ago',
        'sep',
        'oct',
        'nov',
        'dic',
      ],
      today: 'Hoy',
      clear: 'Limpiar',
    });
  }

  loadVentas() {
    this.ventasService.findAllPaginated(this.boletaFilter).subscribe({
      next: (data) => {
        this.dataBoleta = data.content;
        this.totalElements = data.totalElements;
        this.isLoading = false;
      },
      error: (error) => {
        this.isLoading = false;
        console.log('Error al cargar ventas:' + error);
      },
    });
  }

  showDialog(id: number) {
    this.visible = true;
    this.findByIdDetalleBoleta(id);
  }

  buscarVenta() {
    console.log('fechadata', this.fechaInicio);
    this.boletaFilter.fechaInicio = this.fechaInicio
      ? this.formatDate(this.fechaInicio)
      : null;
    this.boletaFilter.fechaFin = this.fechaFin
      ? this.formatDate(this.fechaFin)
      : null;
    this.loadVentas();
  }

  formatDate(date: Date): string {
    if (!date) return '';
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, '0'); // Meses van de 0-11
    const day = date.getDate().toString().padStart(2, '0');
    return `${year}-${month}-${day}`; // Formato `yyyy-MM-dd`
  }

  reporteReady(id: number) {
    this.findByIdDetalleBoleta(id);
    setTimeout(() => {
      this.generarReporteVenta();
    }, 500);
  }

  generarReporteVenta() {
    const doc = new jsPDF();

    // ✅ Cargar el logo desde assets
    const logoUrl = 'menubanner.png';
    const img = new Image();
    img.src = logoUrl;
    img.onload = () => {
      // 📌 Agregar el logo en la esquina superior derecha
      doc.addImage(img, 'PNG', 160, 10, 40, 15);

      // ✅ Título principal
      doc.setFontSize(18);
      doc.setFont('helvetica', 'bold');
      doc.text('Reporte de Venta', 10, 20);
      doc.setLineWidth(0.5);
      doc.line(10, 24, 200, 24); // Línea separadora

      // ✅ Datos de la Venta (izquierda) y Datos del Cliente (derecha)
      doc.setFontSize(12);
      doc.setFont('helvetica', 'bold');
      doc.text('Datos de la Venta', 10, 35);
      doc.text('Datos del Cliente', 120, 35);

      doc.setFontSize(10);
      doc.setFont('helvetica', 'bolditalic');
      doc.text('Email:', 10, 45);
      doc.setFont('helvetica', 'normal');
      doc.text('electrodash@gmail.com', 40, 45);

      doc.setFontSize(10);
      doc.setFont('helvetica', 'bolditalic');
      doc.text('F. Emisión:', 10, 52);
      doc.setFont('helvetica', 'normal');
      doc.text(this.saveBoleta?.fechaEmision || '-', 40, 52);

      doc.setFontSize(10);
      doc.setFont('helvetica', 'bolditalic');
      doc.text('Tipo Venta:', 10, 59);
      doc.setFont('helvetica', 'normal');
      doc.text(this.saveBoleta?.tipoVenta || '-', 40, 59);

      doc.setFont('helvetica', 'bolditalic');
      doc.text('Direccion:', 10, 66);
      doc.setFont('helvetica', 'normal');
      doc.text('Av. proceres 1204, calle sur', 40, 66);

      //---------------
      doc.setFont('helvetica', 'bold');
      doc.text('Nombre:', 120, 45);
      doc.setFont('helvetica', 'normal');
      doc.text(
        `${this.saveBoleta?.cliente?.nombre || '-'} ${
          this.saveBoleta?.cliente?.apellido || '-'
        }`,
        150,
        45
      );

      doc.setFont('helvetica', 'bold');
      doc.text('Nro Doc:', 120, 52);
      doc.setFont('helvetica', 'normal');
      doc.text(this.saveBoleta?.cliente?.ndocumento + '' || '-', 150, 52);

      doc.setFont('helvetica', 'bold');
      doc.text('Teléfono:', 120, 59);
      doc.setFont('helvetica', 'normal');
      doc.text(this.saveBoleta?.cliente?.telefono + '' || '-', 150, 59);

      doc.setFont('helvetica', 'bold');
      doc.text('Dirección:', 120, 66);
      doc.setFont('helvetica', 'normal');

      // Dividir la dirección en varias líneas si es muy larga
      const direccion = this.saveBoleta?.cliente?.direccion || '-';
      const direccionDividida = doc.splitTextToSize(direccion, 50); // Máximo 50px de ancho

      doc.text(direccionDividida, 150, 66);

      // Formatear los valores numéricos como moneda en soles (S/)
      const formatoSoles = new Intl.NumberFormat('es-PE', {
        style: 'currency',
        currency: 'PEN',
      });

      // ✅ **Tabla de productos**
      const productos = this.detalleBoleta.map((detalle) => {
        const precioConDescuento =
          detalle.producto.precio -
          (detalle.producto.precio * detalle.producto.descuento) / 100;

        return [
          detalle.producto.id.toString(),
          detalle.producto.descripcion,
          formatoSoles.format(precioConDescuento), // ✅ Precio con descuento
          detalle.cantidad.toString(),
          formatoSoles.format(detalle.cantidad * precioConDescuento), // ✅ Importe con descuento
        ];
      });

      autoTable(doc, {
        startY: 80,
        head: [['ID', 'Producto', 'Precio', 'Cantidad', 'Importe']],
        body: productos,
        theme: 'grid',
        styles: { fontSize: 10, cellPadding: 3 },
        headStyles: { fillColor: [44, 62, 80], textColor: [255, 255, 255] },
        alternateRowStyles: { fillColor: [240, 240, 240] },
        columnStyles: {
          2: { halign: 'right' }, // Precio normal alineado a la derecha
          3: { halign: 'right' }, // ✅ Precio con descuento alineado
          5: { halign: 'right' }, // ✅ Importe alineado a la derecha
        },
      });

      // ✅ Obtener la última posición de la tabla
      const finalY = (doc as any).autoTable.previous.finalY || 90;

      doc.setFont('helvetica', 'bold');
      doc.text('Subtotal:', 140, finalY + 10);
      doc.text(formatoSoles.format(this.subtotal), 170, finalY + 10);

      doc.text('Descuento:', 140, finalY + 18);
      doc.text(
        formatoSoles.format(this.subtotal - this.totalPagado),
        170,
        finalY + 18
      );

      doc.setFontSize(14);
      doc.text('Total a Pagar:', 130, finalY + 26);
      doc.text(formatoSoles.format(this.totalPagado), 170, finalY + 26);

      // ✅ Guardar el PDF
      doc.save('reporte_venta.pdf');
    };
    this.visible = false;
  }

  findByIdDetalleBoleta(id: number) {
    this.ventasService.findByIdDetalleBoleta(id).subscribe({
      next: (response) => {
        this.detalleBoleta = response;
        this.saveBoleta = response[0].boleta;
        // Asignar el total directamente desde la primera boleta obtenida
        if (response.length > 0) {
          this.totalPagado = response[0].boleta.total;
        } else {
          this.totalPagado = 0;
        }
        this.subtotal = response.reduce((acc, item) => {
          const precioConDescuento =
            item.producto.precio * (1 - item.producto.descuento / 100);
          return acc + precioConDescuento * item.cantidad;
        }, 0);
      },

      error: (err) => {
        console.error('Error al guardar:', err);
      },
    });
  }

  onImageError(event: Event) {
    (event.target as HTMLImageElement).src = 'user-noimage.jpg';
  }

  onLazyLoad(event: any) {
    this.boletaFilter.page = event.first / event.rows + 1;
    this.boletaFilter.size = event.rows;
    // Si la columna tiene un campo para ordenar, lo asignamos
    if (event.sortField) {
      this.boletaFilter.sortBy = event.sortField;
      this.boletaFilter.sortDir = event.sortOrder === 1 ? 'asc' : 'desc'; // 1 para ascendente, -1 para descendente
    }
    this.loadVentas();
  }
}
