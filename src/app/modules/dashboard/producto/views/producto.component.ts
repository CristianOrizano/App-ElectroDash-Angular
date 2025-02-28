import { PrimeModule } from '@/shared/prime/prime.module';
import { Component, inject } from '@angular/core';
import { ProductoService } from '../infraestructure/producto.service';
import { ConfirmationService } from 'primeng/api';
import { NotificationService } from '@/core/services/notification-service';
import { urlmarca, urlproducto } from '@/core/constantes/constantes';
import {
  ProductoFilterRequest,
  ProductoResponse,
} from '../domain/producto.interface';
import { PaginatedRequest } from '@/shared/page/page.request';
import { SkeletonComponent } from '@/shared/skeleton/skeleton.component';
import { ModalSaveComponent } from './components/modal-save/modal-save.component';
import { ModalPhotoProductoComponent } from './components/modal-photo-producto/modal-photo-producto.component';
import { CategoriaResponse } from '../../categoria/domain/categoria.interface';
import { MarcaResponse } from '../../marca/domain/marca.interface';
import { CategoriaService } from '../../categoria/infraestructure/categoria.service';
import { MarcaService } from '../../marca/infraestructure/marca.service';

@Component({
  selector: 'app-producto',
  standalone: true,
  imports: [
    PrimeModule,
    SkeletonComponent,
    ModalSaveComponent,
    ModalPhotoProductoComponent,
  ],
  templateUrl: './producto.component.html',
  styleUrl: './producto.component.css',
})
export class ProductoComponent {
  private productoService = inject(ProductoService);
  private confirmationService = inject(ConfirmationService);
  private notification = inject(NotificationService);
  private categoriaService = inject(CategoriaService);
  private marcaService = inject(MarcaService);

  estadoOptions = [
    { nombre: 'Activo', valor: true },
    { nombre: 'Inactivo', valor: false },
  ];
  urlMarca: string = urlmarca;
  urlProducto: string = urlproducto;
  isLoading: boolean = true;
  displayDialog: boolean = false;
  displayDialogPhoto: boolean = false;
  idProductoModal: number = 0;
  idProductoPhotoModal: number = 0;
  listCategoria!: CategoriaResponse[];
  listMarca!: MarcaResponse[];
  //api
  dataProducto!: ProductoResponse[];
  totalElements!: number;
  productoFilter: ProductoFilterRequest = {
    page: 1,
    size: 10,
    sortBy: 'id',
    sortDir: 'asc',
  };

  ngOnInit() {
    this.loadProductos();
    this.findAllCategoria();
    this.findAllMarca();
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

  loadProductos() {
    this.productoService.findAllPaginated(this.productoFilter).subscribe({
      next: (data) => {
        this.dataProducto = data.content;
        this.totalElements = data.totalElements;
        this.isLoading = false;
      },
      error: (error) => {
        console.log('Error al cargar productos:' + error);
        this.isLoading = false;
      },
    });
  }

  onStateChange(id: number) {
    this.confirmationService.confirm({
      header: 'Cambiar Estado',
      message: '¿Estás seguro de que deseas cambiar el estado?',
      icon: 'pi pi-info-circle',
      acceptButtonStyleClass: 'p-button-danger p-button-text',
      rejectButtonStyleClass: 'p-button-text p-button-text',
      acceptIcon: 'none',
      rejectIcon: 'none',
      accept: () => {
        this.deleteProducto(id);
      },
      reject: () => {},
    });
  }

  deleteProducto(id: number) {
    this.productoService.delete(id).subscribe({
      next: (response) => {
        this.notification.showSuccess('Correcto', `Éxito al cambiar estado`);
        this.loadProductos();
      },

      error: (err) => {
        console.error('Error al guardar:', err);
      },
    });
  }

  openDialog(producto?: ProductoResponse) {
    this.idProductoModal = producto?.id || 0;
    this.displayDialog = true;
  }

  openDialogPhoto(categoria?: ProductoResponse) {
    this.idProductoPhotoModal = categoria?.id || 0;
    this.displayDialogPhoto = true;
  }

  onImageError(event: Event) {
    (event.target as HTMLImageElement).src = 'not-found.png';
  }

  buscarProductos() {
    // Si la descripción está vacía o tiene solo espacios, la convertimos en null
    if (this.productoFilter.descripcion?.trim() === '') {
      this.productoFilter.descripcion = null;
    }
    this.loadProductos();
  }

  onLazyLoad(event: any) {
    this.productoFilter.page = event.first / event.rows + 1;
    this.productoFilter.size = event.rows;
    // Si la columna tiene un campo para ordenar, lo asignamos
    if (event.sortField) {
      this.productoFilter.sortBy = event.sortField;
      this.productoFilter.sortDir = event.sortOrder === 1 ? 'asc' : 'desc'; // 1 para ascendente, -1 para descendente
    }
    this.loadProductos();
  }
}
