import { Component, inject } from '@angular/core';
import { VentaService } from '../../infraestructure/venta.service';
import { ConfirmationService } from 'primeng/api';
import { NotificationService } from '@/core/services/notification-service';
import { PaginatedRequest } from '@/shared/page/page.request';
import {
  BoletaResponse,
  DetalleBoletaResponse,
} from '../../domain/venta.interface';
import { PrimeModule } from '@/shared/prime/prime.module';
import { SkeletonComponent } from '../../../../../shared/skeleton/skeleton.component';
import { urlproducto, urlusuario } from '@/core/constantes/constantes';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

@Component({
  selector: 'app-listar-venta',
  standalone: true,
  imports: [PrimeModule, SkeletonComponent],
  templateUrl: './listar-venta.component.html',
  styleUrl: './listar-venta.component.css',
})
export class ListarVentaComponent {
  private ventasService = inject(VentaService);

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
  boletaFilter: PaginatedRequest = {
    page: 1,
    size: 10,
    sortBy: 'id',
    sortDir: 'asc',
  };

  ngOnInit() {
    this.loadVentas();
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
      const productos = this.detalleBoleta.map((detalle) => [
        detalle.producto.id.toString(),
        detalle.producto.descripcion,
        detalle.cantidad.toString(),
        formatoSoles.format(detalle.cantidad * detalle.producto.precio),
      ]);

      autoTable(doc, {
        startY: 80,
        head: [['ID', 'Producto', 'Cantidad', 'importe']],
        body: productos,
        theme: 'grid',
        styles: { fontSize: 10, cellPadding: 3 },
        headStyles: { fillColor: [44, 62, 80], textColor: [255, 255, 255] },
        alternateRowStyles: { fillColor: [240, 240, 240] },
        columnStyles: {
          3: { halign: 'right' }, // Alinear montos a la derecha
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
        // Calcular el subtotal sumando (precio * cantidad) de cada producto
        this.subtotal = response.reduce((acc, item) => {
          return acc + item.producto.precio * item.cantidad;
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
