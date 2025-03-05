import { PrimeModule } from '@/shared/prime/prime.module';
import { Component, inject } from '@angular/core';
import { CategoriaService } from '../../categoria/infraestructure/categoria.service';
import { ConfirmationService } from 'primeng/api';
import { NotificationService } from '@/core/services/notification-service';
import {
  CategoriaFilterRequest,
  CategoriaResponse,
  CategoriaSimpleList,
} from '../../categoria/domain/categoria.interface';
import { urlcategoria, urlmarca } from '@/core/constantes/constantes';
import { MarcaService } from '../../marca/infraestructure/marca.service';
import { MarcaResponse } from '../../marca/domain/marca.interface';
import autoTable from 'jspdf-autotable';
import jsPDF from 'jspdf';
import { ProductoResponse } from '../../producto/domain/producto.interface';
import { ProductoService } from '../../producto/infraestructure/producto.service';

@Component({
  selector: 'app-reporte-inventario',
  standalone: true,
  imports: [PrimeModule],
  templateUrl: './reporte-inventario.component.html',
  styleUrl: './reporte-inventario.component.css',
})
export class ReporteInventarioComponent {
  private categoriaService = inject(CategoriaService);
  private marcaService = inject(MarcaService);
  private productoService = inject(ProductoService);
  private confirmationService = inject(ConfirmationService);
  private notification = inject(NotificationService);
  tabs: { title: string; content: string }[] = [];

  seleccionTodos: boolean = false;
  selectedCategoria: CategoriaSimpleList | null = null;
  selectedMarca: MarcaResponse | null = null;
  urlCategoria: string = urlcategoria;
  urlMarca: string = urlmarca;
  isLoading: boolean = true;
  //api
  listCategoria!: CategoriaResponse[];
  listMarca!: MarcaResponse[];
  responsiveOptions: any[] | undefined;

  ngOnInit() {
    this.findAllCategoria();
    this.findAllMarca();
    this.tabs = [
      { title: 'Tab 1', content: 'Tab 1 Content' },
      { title: 'Tab 2', content: 'Tab 2 Content' },
      { title: 'Tab 3', content: 'Tab 3 Content' },
    ];

    this.responsiveOptions = [
      {
        breakpoint: '1199px',
        numVisible: 1,
        numScroll: 1,
      },
      {
        breakpoint: '991px',
        numVisible: 2,
        numScroll: 1,
      },
      {
        breakpoint: '767px',
        numVisible: 1,
        numScroll: 1,
      },
    ];
  }

  findAllMarca() {
    this.marcaService.findAll().subscribe({
      next: (response) => {
        this.listMarca = response;
      },
      error: (err) => {
        console.error('Error al obtener:', err);
      },
    });
  }

  findAllCategoria() {
    this.categoriaService.findAll().subscribe({
      next: (response) => {
        this.listCategoria = response;
      },
      error: (err) => {
        console.error('Error al obtener:', err);
      },
    });
  }

  selectCategoria(categoria: CategoriaSimpleList) {
    this.selectedCategoria = categoria;
    this.selectedMarca = null;
    this.seleccionTodos = false;
  }
  selectMarca(marca: MarcaResponse) {
    this.selectedMarca = marca;
    this.selectedCategoria = null;
    this.seleccionTodos = false;
  }
  selectTodos() {
    this.selectedCategoria = null;
    this.selectedMarca = null;
    this.seleccionTodos = true;
  }

  generarReporte() {
    if (
      !this.seleccionTodos &&
      !this.selectedCategoria &&
      !this.selectedMarca
    ) {
      this.notification.showError(
        'Error',
        'Debes seleccionar una categoría, una marca o "Todos los productos" antes de generar el reporte.'
      );
      return;
    }

    this.productoService.findAll().subscribe({
      next: (productos) => {
        let productosFiltrados = productos;
        if (!this.seleccionTodos) {
          if (this.selectedCategoria) {
            productosFiltrados = productosFiltrados.filter(
              (p) => p.categoria.id === this.selectedCategoria?.id
            );
          }

          if (this.selectedMarca) {
            productosFiltrados = productosFiltrados.filter(
              (p) => p.marca.id === this.selectedMarca?.id
            );
          }
        }

        if (productosFiltrados.length === 0) {
          this.notification.showError(
            'Error',
            'No hay productos en la categoría o marca seleccionada.'
          );
          return;
        }

        this.generarPdf(productosFiltrados);
      },
      error: (err: any) => {
        console.error('Error al obtener productos:', err);
        alert('Ocurrió un error al generar el reporte.');
      },
    });
  }

  generarPdf(datos: ProductoResponse[]) {
    const doc = new jsPDF();
    doc.text('Reporte de Productos', 10, 10);

    const tabla = datos.map((producto) => [
      producto.id,
      producto.descripcion,
      producto.stock,
      `S/ ${producto.precio.toFixed(2)}`,
      producto.categoria.nombre,
      producto.marca.nombre,
    ]);

    autoTable(doc, {
      head: [['ID', 'Descripción', 'Stock', 'Precio', 'Categoría', 'Marca']],
      body: tabla,
      startY: 20,
      theme: 'grid',
    });

    doc.save('reporte_productos.pdf');
  }

  onImageError(event: Event) {
    (event.target as HTMLImageElement).src = 'not-found.png';
  }
}
