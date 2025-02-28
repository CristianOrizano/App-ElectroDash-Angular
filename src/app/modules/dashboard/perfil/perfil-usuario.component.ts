import { urlusuario } from '@/core/constantes/constantes';
import { ImageUploadService } from '@/core/services/image-upload.service';
import { LoginResponse } from '@/modules/auth/domain/auth.interface';
import { AuthService } from '@/modules/auth/infraestructure/auth.service';
import { PrimeModule } from '@/shared/prime/prime.module';
import { Component, inject } from '@angular/core';
import { v4 as uuidv4 } from 'uuid';
import {
  UsuarioRequest,
  UsuarioResponse,
} from '../usuario/domain/usuario.interface';
import { UsuarioService } from '../usuario/infraestructure/usuario.service';
import { NotificationService } from '@/core/services/notification-service';

@Component({
  selector: 'app-perfil-usuario',
  standalone: true,
  imports: [PrimeModule],
  templateUrl: './perfil-usuario.component.html',
  styleUrl: './perfil-usuario.component.css',
})
export class PerfilUsuarioComponent {
  private imageUploadService = inject(ImageUploadService);
  private authService = inject(AuthService);
  private usuarioService = inject(UsuarioService);
  private notification = inject(NotificationService);

  auth!: LoginResponse | null;
  tableData: { campo: string; dato: any }[] = [];
  visible: boolean = false;

  saveUsuario!: UsuarioRequest | undefined;
  urlUsuario: string = urlusuario;
  photoError: boolean = false;
  photoSelected!: string | null;
  selectedFile!: File;
  fileSelected: boolean = false;

  ngOnInit() {
    this.auth = this.authService.getAuthorization();
    if (this.auth && this.auth.usuario) {
      const roles = this.auth.usuario.roles
        .map((role) => role.nombre)
        .join(', ');
      this.tableData = [
        { campo: 'ID', dato: this.auth.usuario.id },
        { campo: 'Nombre', dato: this.auth.usuario.nombre },
        { campo: 'Apellido', dato: this.auth.usuario.apellido },
        { campo: 'Rol', dato: roles },
        { campo: 'Username', dato: this.auth.usuario.username },
        { campo: 'Password', dato: this.auth.usuario.password },
      ];
    }
  }
  onImageError(event: Event) {
    (event.target as HTMLImageElement).src = 'not-found.png';
  }

  showDialog() {
    this.visible = true;
    this.saveUsuario = this.auth?.usuario
      ? {
          ...this.auth.usuario,
          roles: this.auth.usuario.roles
            ? this.auth.usuario.roles.map((role) => role.id)
            : [],
        }
      : undefined;

    if (this.auth?.usuario.nimagen) {
      this.photoSelected = this.urlUsuario + this.auth?.usuario.nimagen;
    }
  }

  closeModal() {
    this.fileSelected = false;
    this.photoSelected = null;
    this.photoError = false;
    this.visible = false;
  }

  async updateImage() {
    const saveUsuario: UsuarioRequest = {
      nombre: this.auth?.usuario?.nombre ?? '',
      apellido: this.auth?.usuario?.apellido ?? '',
      nimagen: this.auth?.usuario?.nimagen ?? '',
      username: this.auth?.usuario?.username ?? '',
      password: this.auth?.usuario?.password ?? '',
      roles: this.auth?.usuario?.roles?.map((role) => role.id) ?? [],
    };

    const nombre = uuidv4(); //nombre único para la imagen
    const filePathNew = `usuario/${nombre}`;
    const filePathOri = this.auth?.usuario.nimagen
      ? `usuario/${this.auth?.usuario.nimagen}`
      : null;
    // Actualizar o subir la imagen
    if (filePathOri) {
      await this.imageUploadService.updateImge(
        this.selectedFile,
        filePathOri,
        filePathNew
      );
    } else {
      await this.imageUploadService.uploadImage(this.selectedFile, filePathNew);
    }
    // Actualizar el modelo de datos
    saveUsuario.nimagen = nombre;
    await this.updateUsuario(this.auth?.usuario?.id as number, saveUsuario);
  }

  updateUsuario(id: number, saveusuario: UsuarioRequest) {
    this.usuarioService.update(saveusuario, id).subscribe({
      next: (response) => {
        this.notification.showSuccess('Correcto', 'Exito al Actualizar');
        if (this.auth) {
          this.auth.usuario = response;
          this.authService.saveAuthorization(this.auth);
          this.closeModal();
        }
      },
      error: (err) => {
        console.error('Error al guardar:', err);
      },
    });
  }

  onPhotoSelected(event: any) {
    this.selectedFile = event.target.files[0];
    console.log('SEEE');
    const validTypes = ['image/png', 'image/jpeg', 'image/jpg'];
    if (this.selectedFile) {
      this.fileSelected = true;
      this.photoError = !validTypes.includes(this.selectedFile.type);
      this.photoSelected = this.photoError
        ? null
        : URL.createObjectURL(this.selectedFile);
    } else {
      this.fileSelected = false;
      this.photoSelected = null;
      this.photoError = false;
    }
  }
}
