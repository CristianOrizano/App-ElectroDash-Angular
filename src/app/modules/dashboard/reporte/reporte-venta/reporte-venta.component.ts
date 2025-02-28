import { PrimeModule } from '@/shared/prime/prime.module';
import { Component, inject } from '@angular/core';
import { PrimeNGConfig } from 'primeng/api';
import { LocaleSettings } from 'primeng/calendar';
import { VentaService } from '../../venta/infraestructure/venta.service';
import {
  BoletaFilterFechas,
  BoletaResponse,
} from '../../venta/domain/venta.interface';
import autoTable from 'jspdf-autotable';
import jsPDF from 'jspdf';
import { NotificationService } from '@/core/services/notification-service';

@Component({
  selector: 'app-reporte-venta',
  standalone: true,
  imports: [PrimeModule],
  templateUrl: './reporte-venta.component.html',
  styleUrl: './reporte-venta.component.css',
})
export class ReporteVentaComponent {
  private ventasService = inject(VentaService);
  private notification = inject(NotificationService);
  ventas = [{ realizadas: 3, total: 101.5, costo: 30.0, ganancias: 71.5 }];
  fechaInicio: Date | null = null;
  fechaFin: Date | null = null;

  constructor(private primeNGConfig: PrimeNGConfig) {}
  ngOnInit() {
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
      dateFormat: 'dd/mm/yy',
    });
  }

  formatDate(fecha: Date): string {
    const year = fecha.getFullYear();
    const month = String(fecha.getMonth() + 1).padStart(2, '0');
    const day = String(fecha.getDate()).padStart(2, '0');

    return `${year}-${month}-${day}`; // Formato ISO 8601 (YYYY-MM-DD)
  }

  generarReporte() {
    if (!this.fechaInicio || !this.fechaFin) {
      this.notification.showError('Error', `Debe Ingresar Ambas Fechas`);
      return;
    }
    const filtro: BoletaFilterFechas = {
      fechaInicio: this.formatDate(this.fechaInicio),
      fechaFin: this.formatDate(this.fechaFin),
    };

    this.buscarPorFiltroFechas(filtro);
  }

  buscarPorFiltroFechas(filtro: BoletaFilterFechas) {
    this.ventasService.findByFilterDates(filtro).subscribe({
      next: (data: BoletaResponse[]) => {
        if (data.length === 0) {
          this.notification.showError(
            'Error',
            `No hay registros en el rango de fechas seleccionado.`
          );
          return;
        }
        this.generarPdf(data);
      },
      error: (err) => {
        console.error('Error al obtener los datos:', err);
        alert('Ocurrió un error al generar el reporte.');
      },
    });
  }

  generarPdf(datos: BoletaResponse[]) {
    const doc = new jsPDF();
    // Título del reporte
    doc.text('Reporte de Ventas', 10, 10);
    // Convertir datos a formato de tabla
    const tabla = datos.map((boleta) => [
      boleta.id,
      boleta.fechaEmision,
      `${boleta.cliente.nombre} ${boleta.cliente.apellido}`,
      `${boleta.usuario.nombre} ${boleta.usuario.apellido}`,
      `S/ ${boleta.total.toFixed(2)}`,
    ]);
    // Generar la tabla
    autoTable(doc, {
      head: [['ID', 'Fecha Emisión', 'Cliente', 'Vendedor', 'Total']],
      body: tabla,
      startY: 20,
      theme: 'grid',
    });

    // Guardar PDF
    doc.save('reporte_boletas.pdf');
  }
}
