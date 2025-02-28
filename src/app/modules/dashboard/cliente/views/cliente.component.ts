import { Component, inject } from '@angular/core';
import { ClienteService } from '../infraestructure/cliente.service';
import { ConfirmationService } from 'primeng/api';
import { NotificationService } from '@/core/services/notification-service';
import { PaginatedRequest } from '@/shared/page/page.request';
import {
  ClienteFilterRequest,
  ClienteResponse,
} from '../domain/cliente.interface';
import { PrimeModule } from '@/shared/prime/prime.module';
import { SkeletonComponent } from '@/shared/skeleton/skeleton.component';
import { ClienteSaveModalComponent } from './components/cliente-save-modal/cliente-save-modal.component';

@Component({
  selector: 'app-cliente',
  standalone: true,
  imports: [PrimeModule, SkeletonComponent, ClienteSaveModalComponent],
  templateUrl: './cliente.component.html',
  styleUrl: './cliente.component.css',
})
export class ClienteComponent {
  private clienteService = inject(ClienteService);
  private confirmationService = inject(ConfirmationService);
  private notification = inject(NotificationService);

  displayDialog: boolean = false;
  isLoading: boolean = true;
  idClienteModal: number = 0;
  estadoOptions = [
    { nombre: 'Activo', valor: true },
    { nombre: 'Inactivo', valor: false },
  ];
  //api
  dataCliente!: ClienteResponse[];
  totalElements!: number;
  clienteFilter: ClienteFilterRequest = {
    page: 1,
    size: 10,
    sortBy: 'id',
    sortDir: 'asc',
  };

  ngOnInit() {
    this.loadClientes();
  }

  loadClientes() {
    this.clienteService.findAllPaginated(this.clienteFilter).subscribe({
      next: (data) => {
        this.dataCliente = data.content;
        this.totalElements = data.totalElements;
        this.isLoading = false;
      },
      error: (error) => {
        console.log('Error al cargar cliente:' + error);
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
        this.deleteCliente(id);
      },
      reject: () => {},
    });
  }

  deleteCliente(id: number) {
    this.clienteService.delete(id).subscribe({
      next: (response) => {
        this.notification.showSuccess('Correcto', `Éxito al cambiar estado`);
        this.loadClientes();
      },
      error: (err) => {
        console.error('Error al guardar:', err);
      },
    });
  }

  openDialog(cliente?: ClienteResponse) {
    this.idClienteModal = cliente?.id || 0;
    this.displayDialog = true;
  }

  buscarClientes() {
    if (this.clienteFilter.nombre?.trim() === '') {
      this.clienteFilter.nombre = null;
    }
    if (this.clienteFilter.apellido?.trim() === '') {
      this.clienteFilter.apellido = null;
    }
    if (this.clienteFilter.direccion?.trim() === '') {
      this.clienteFilter.direccion = null;
    }
    this.loadClientes();
  }

  onLazyLoad(event: any) {
    this.clienteFilter.page = event.first / event.rows + 1;
    this.clienteFilter.size = event.rows;
    // Si la columna tiene un campo para ordenar, lo asignamos
    if (event.sortField) {
      this.clienteFilter.sortBy = event.sortField;
      this.clienteFilter.sortDir = event.sortOrder === 1 ? 'asc' : 'desc'; // 1 para ascendente, -1 para descendente
    }
    this.loadClientes();
  }
}
