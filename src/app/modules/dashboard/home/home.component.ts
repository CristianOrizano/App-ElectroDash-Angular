import { Component, inject, OnInit } from '@angular/core';
import { PrimeModule } from '../../../shared/prime/prime.module';
import { VentaService } from '../venta/infraestructure/venta.service';
import { BoletaResponse } from '../venta/domain/venta.interface';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [PrimeModule],
  templateUrl: './home.component.html',
  styleUrl: './home.component.css',
})
export class HomeComponent implements OnInit {
  private ventaService = inject(VentaService);
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
    this.ventaService.findAll().subscribe((ventas) => {
      this.dataVentas = ventas;
      // Procesar los datos después de que se hayan cargado
      const ventasPorMes = this.agruparVentasPorMes(this.dataVentas);
      this.basicData = this.prepararDatosParaGrafico(ventasPorMes);
      this.basicOptions = this.getChartOptions();
      // Generar datos para el gráfico de pastel
      this.pieData = this.prepararDatosParaPie(this.dataVentas);
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
}
