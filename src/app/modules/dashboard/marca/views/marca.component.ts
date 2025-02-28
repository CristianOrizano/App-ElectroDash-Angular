import { Component, inject } from '@angular/core';
import { MarcaFilterRequest, MarcaResponse } from '../domain/marca.interface';
import { MarcaService } from '../infraestructure/marca.service';
import { ConfirmationService } from 'primeng/api';
import { NotificationService } from '@/core/services/notification-service';
import { SkeletonComponent } from '../../../../shared/skeleton/skeleton.component';
import { PrimeModule } from '@/shared/prime/prime.module';
import { PaginatedRequest } from '@/shared/page/page.request';
import { urlmarca } from '@/core/constantes/constantes';
import { ModalPhotoMarcaComponent } from './components/modal-photo-marca/modal-photo-marca.component';
import { ModalSaveMarcaComponent } from './components/modal-save-marca/modal-save-marca.component';

@Component({
  selector: 'app-marca',
  standalone: true,
  imports: [
    SkeletonComponent,
    PrimeModule,
    ModalPhotoMarcaComponent,
    ModalSaveMarcaComponent,
  ],
  templateUrl: './marca.component.html',
  styleUrl: './marca.component.css',
})
export class MarcaComponent {
  private marcaService = inject(MarcaService);
  private confirmationService = inject(ConfirmationService);
  private notification = inject(NotificationService);

  urlMarca: string = urlmarca;
  isLoading: boolean = true;
  displayDialog: boolean = false;
  displayDialogPhoto: boolean = false;
  idMarcaModal: number = 0;
  idMarcaPhotoModal: number = 0;
  estadoOptions = [
    { nombre: 'Activo', valor: true },
    { nombre: 'Inactivo', valor: false },
  ];
  //api
  dataMarca!: MarcaResponse[];
  totalElements!: number;
  marcaFilter: MarcaFilterRequest = {
    page: 1,
    size: 10,
    sortBy: 'id',
    sortDir: 'asc',
  };
  ngOnInit() {
    this.loadMarcas();
  }

  loadMarcas() {
    this.marcaService.findAllPaginated(this.marcaFilter).subscribe({
      next: (data) => {
        this.dataMarca = data.content;
        this.totalElements = data.totalElements;
        this.isLoading = false;
      },
      error: (error) => {
        console.log('Error al cargar marcas:' + error);
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
        this.deleteMarca(id);
      },
      reject: () => {},
    });
  }

  deleteMarca(id: number) {
    this.marcaService.delete(id).subscribe({
      next: (response) => {
        this.notification.showSuccess('Correcto', `Éxito al cambiar estado`);
        this.loadMarcas();
      },
      error: (err) => {
        console.error('Error al guardar:', err);
      },
    });
  }
  onImageError(event: Event) {
    (event.target as HTMLImageElement).src = 'not-found.png';
  }

  openDialog(marca?: MarcaResponse) {
    this.idMarcaModal = marca?.id || 0;
    this.displayDialog = true;
  }
  openDialogPhoto(marca?: MarcaResponse) {
    this.idMarcaPhotoModal = marca?.id || 0;
    this.displayDialogPhoto = true;
  }

  buscarMarcas() {
    if (this.marcaFilter.nombre?.trim() === '') {
      this.marcaFilter.nombre = null;
    }
    this.loadMarcas();
  }

  onLazyLoad(event: any) {
    this.marcaFilter.page = event.first / event.rows + 1;
    this.marcaFilter.size = event.rows;
    // Si la columna tiene un campo para ordenar, lo asignamos
    if (event.sortField) {
      this.marcaFilter.sortBy = event.sortField;
      this.marcaFilter.sortDir = event.sortOrder === 1 ? 'asc' : 'desc'; // 1 para ascendente, -1 para descendente
    }
    this.loadMarcas();
  }
}
