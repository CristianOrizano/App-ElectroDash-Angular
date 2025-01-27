import { PrimeModule } from '@/shared/prime/prime.module';
import { Component, inject } from '@angular/core';
import { ProductoService } from '../infraestructure/producto.service';
import { ConfirmationService } from 'primeng/api';
import { NotificationService } from '@/core/services/notification-service';
import { urlproducto } from '@/core/constantes/constantes';
import { ProductoResponse } from '../domain/producto.interface';
import { PaginatedRequest } from '@/shared/page/page.request';
import { SkeletonComponent } from '@/shared/skeleton/skeleton.component';
import { ModalSaveComponent } from './components/modal-save/modal-save.component';
import { ModalPhotoProductoComponent } from './components/modal-photo-producto/modal-photo-producto.component';

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

  urlProducto: string = urlproducto;
  isLoading: boolean = true;
  displayDialog: boolean = false;
  displayDialogPhoto: boolean = false;
  idProductoModal: number = 0;
  idProductoPhotoModal: number = 0;
  //api
  dataProducto!: ProductoResponse[];
  totalElements!: number;
  productoFilter: PaginatedRequest = {
    page: 1,
    size: 10,
    sortBy: 'id',
    sortDir: 'asc',
  };

  ngOnInit() {
    this.loadProductos();
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
