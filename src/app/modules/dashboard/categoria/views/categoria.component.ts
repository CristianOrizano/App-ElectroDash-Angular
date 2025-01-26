import { Component, inject } from '@angular/core';
import { CategoriaResponse } from '../domain/categoria.interface';
import { ModalPhotoComponent } from './components/modal-photo/modal-photo.component';
import { ConfirmationService } from 'primeng/api';
import { PrimeModule } from '@/shared/prime/prime.module';
import { CategoriaService } from '../infraestructure/categoria.service';
import { PaginatedRequest } from '@/shared/page/page.request';
import { SkeletonComponent } from '@/shared/skeleton/skeleton.component';
import { NotificationService } from '@/core/services/notification-service';
import { urlcategoria } from '@/core/constantes/constantes';
import { CategoriaModalComponent } from './components/categoria-modal/categoria-modal.component';

@Component({
  selector: 'app-categoria',
  standalone: true,
  imports: [
    PrimeModule,
    SkeletonComponent,
    CategoriaModalComponent,
    ModalPhotoComponent,
  ],
  providers: [],
  templateUrl: './categoria.component.html',
  styleUrl: './categoria.component.css',
})
export class CategoriaComponent {
  private categoriaService = inject(CategoriaService);
  private confirmationService = inject(ConfirmationService);
  private notification = inject(NotificationService);

  urlCategoria: string = urlcategoria;
  isLoading: boolean = true;
  displayDialog: boolean = false;
  displayDialogPhoto: boolean = false;
  idCategoriaModal: number = 0;
  idCategoriaPhotoModal: number = 0;
  //api
  dataCategoria!: CategoriaResponse[];
  totalElements!: number;
  categoriaFilter: PaginatedRequest = {
    page: 1,
    size: 10,
    sortBy: 'id',
    sortDir: 'asc',
  };

  ngOnInit() {
    this.loadCategorias();
  }

  loadCategorias() {
    this.categoriaService.findAllPaginated(this.categoriaFilter).subscribe({
      next: (data) => {
        this.dataCategoria = data.content;
        this.totalElements = data.totalElements;
        this.isLoading = false;
      },
      error: (error) => {
        console.log('Error al cargar categorías:' + error);
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
        this.deleteCategoria(id);
      },
      reject: () => {},
    });
  }

  deleteCategoria(id: number) {
    this.categoriaService.delete(id).subscribe({
      next: (response) => {
        this.notification.showSuccess('Correcto', `Éxito al cambiar estado`);
        this.loadCategorias();
      },
      error: (err) => {
        console.error('Error al guardar:', err);
      },
    });
  }

  onImageError(event: Event) {
    (event.target as HTMLImageElement).src = 'nada2.png';
  }

  openDialog(categoria?: CategoriaResponse) {
    this.idCategoriaModal = categoria?.id || 0;
    this.displayDialog = true;
  }

  openDialogPhoto(categoria?: CategoriaResponse) {
    this.idCategoriaPhotoModal = categoria?.id || 0;
    this.displayDialogPhoto = true;
  }

  onLazyLoad(event: any) {
    this.categoriaFilter.page = event.first / event.rows + 1;
    this.categoriaFilter.size = event.rows;
    // Si la columna tiene un campo para ordenar, lo asignamos
    if (event.sortField) {
      this.categoriaFilter.sortBy = event.sortField;
      this.categoriaFilter.sortDir = event.sortOrder === 1 ? 'asc' : 'desc'; // 1 para ascendente, -1 para descendente
    }
    this.loadCategorias();
  }
}
