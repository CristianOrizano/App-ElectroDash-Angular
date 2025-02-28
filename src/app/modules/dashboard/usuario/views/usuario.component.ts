import { PrimeModule } from '@/shared/prime/prime.module';
import { Component, inject } from '@angular/core';
import { UsuarioService } from '../infraestructure/usuario.service';
import { ConfirmationService } from 'primeng/api';
import { NotificationService } from '@/core/services/notification-service';
import { urlusuario } from '@/core/constantes/constantes';
import {
  UsuarioFilterRequest,
  UsuarioRequest,
  UsuarioResponse,
} from '../domain/usuario.interface';
import { PaginatedRequest } from '@/shared/page/page.request';
import { SkeletonComponent } from '../../../../shared/skeleton/skeleton.component';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

@Component({
  selector: 'app-usuario',
  standalone: true,
  imports: [PrimeModule, SkeletonComponent],
  templateUrl: './usuario.component.html',
  styleUrl: './usuario.component.css',
})
export class UsuarioComponent {
  private usuarioService = inject(UsuarioService);
  private confirmationService = inject(ConfirmationService);
  private notification = inject(NotificationService);
  private formBuilder = inject(FormBuilder);

  urlUsuario: string = urlusuario;
  isLoading: boolean = true;
  displayDialog: boolean = false;
  idUsuarioModal: number = 0;
  visible: boolean = false;
  estadoOptions = [
    { nombre: 'Activo', valor: true },
    { nombre: 'Inactivo', valor: false },
  ];
  //api
  dataUsuario!: UsuarioResponse[];
  totalElements!: number;
  usuarioFilter: UsuarioFilterRequest = {
    page: 1,
    size: 10,
    sortBy: 'id',
    sortDir: 'asc',
  };

  usuarioForm!: FormGroup;

  ngOnInit() {
    this.loadUsuarios();

    this.usuarioForm = this.formBuilder.group({
      nombre: ['', [Validators.required]],
      apellido: ['', [Validators.required]],
      username: ['', [Validators.required]],
      password: ['', [Validators.required]],
    });
  }

  showDialog() {
    this.visible = true;
  }

  loadUsuarios() {
    this.usuarioService.findAllPaginated(this.usuarioFilter).subscribe({
      next: (data) => {
        this.dataUsuario = data.content;
        this.totalElements = data.totalElements;
        this.isLoading = false;
      },
      error: (error) => {
        console.log('Error al cargar categorías:' + error);
        this.isLoading = false;
      },
    });
  }

  saveUsuario() {
    const saveUsuario: UsuarioRequest = this.usuarioForm.value;
    saveUsuario.roles = [1];
    if (this.usuarioForm.valid) {
      this.createUsuario(saveUsuario);
    } else {
      this.usuarioForm.markAllAsTouched();
    }
  }

  createUsuario(saveUsuario: UsuarioRequest) {
    this.usuarioService.create(saveUsuario).subscribe({
      next: () => {
        this.notification.showSuccess('Correcto', 'Exito al guardar');
        this.closeModal();
        this.loadUsuarios();
      },
      error: (err) => {
        console.error('Error al guardar:', err);
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
        this.deleteUsuario(id);
      },
      reject: () => {},
    });
  }

  deleteUsuario(id: number) {
    this.usuarioService.delete(id).subscribe({
      next: (response) => {
        this.notification.showSuccess('Correcto', `Éxito al cambiar estado`);
        this.loadUsuarios();
      },
      error: (err) => {
        console.error('Error al guardar:', err);
      },
    });
  }

  onImageError(event: Event) {
    (event.target as HTMLImageElement).src = 'user-noimage.jpg';
  }

  openDialog(usuario?: UsuarioResponse) {
    this.displayDialog = true;
  }

  closeModal() {
    this.visible = false;
    this.usuarioForm.reset();
  }

  buscarUsuarios() {
    if (this.usuarioFilter.nombre?.trim() === '') {
      this.usuarioFilter.nombre = null;
    }
    if (this.usuarioFilter.apellido?.trim() === '') {
      this.usuarioFilter.apellido = null;
    }
    this.loadUsuarios();
  }

  onLazyLoad(event: any) {
    this.usuarioFilter.page = event.first / event.rows + 1;
    this.usuarioFilter.size = event.rows;
    // Si la columna tiene un campo para ordenar, lo asignamos
    if (event.sortField) {
      this.usuarioFilter.sortBy = event.sortField;
      this.usuarioFilter.sortDir = event.sortOrder === 1 ? 'asc' : 'desc'; // 1 para ascendente, -1 para descendente
    }
    this.loadUsuarios();
  }
}
