import {
  Component,
  EventEmitter,
  inject,
  Input,
  OnChanges,
  Output,
  SimpleChanges,
} from '@angular/core';

import { v4 as uuidv4 } from 'uuid';
import { PrimeModule } from '@/shared/prime/prime.module';
import { NotificationService } from '@/core/services/notification-service';
import { ImageUploadService } from '@/core/services/image-upload.service';
import { urlcategoria } from '@/core/constantes/constantes';
import { CategoriaService } from '@/modules/dashboard/categoria/infraestructure/categoria.service';
import {
  CategoriaRequest,
  CategoriaResponse,
} from '../../../domain/categoria.interface';

@Component({
  selector: 'app-modal-photo',
  standalone: true,
  imports: [PrimeModule],
  templateUrl: './modal-photo.component.html',
  styleUrl: './modal-photo.component.css',
})
export class ModalPhotoComponent implements OnChanges {
  @Input() dialog!: boolean;
  @Output() dialogChange = new EventEmitter<boolean>();

  @Input() categoriaId!: number;
  @Output() categoriaIdChange = new EventEmitter<any>();
  @Output() refreshList = new EventEmitter<void>();

  private notification = inject(NotificationService);
  private imageUploadService = inject(ImageUploadService);
  private categoriaService = inject(CategoriaService);

  dataCategoria!: CategoriaRequest;
  urlCategoria: string = urlcategoria;
  photoError: boolean = false;
  photoSelected!: string | null;
  selectedFile!: File;
  fileSelected: boolean = false;

  ngOnChanges(changes: SimpleChanges) {
    if (changes['categoriaId'] && this.categoriaId != 0) {
      console.log('CAMBIO>>>>>>>>>');
      this.assignPhoto();
    }
  }

  closeModal() {
    this.fileSelected = false;
    this.photoSelected = null;
    this.photoError = false;
    this.dialogChange.emit(false);
    this.categoriaIdChange.emit(0);
  }

  assignPhoto() {
    if (this.categoriaId !== 0) {
      this.findByIdCategoria(this.categoriaId);
    }
  }

  onImageError(event: Event) {
    (event.target as HTMLImageElement).src = 'not-found.png';
  }

  async updateImage() {
    const nombre = uuidv4(); //nombre único para la imagen
    const filePathNew = `categoria/${nombre}`;
    const filePathOri = this.dataCategoria.nimagen
      ? `categoria/${this.dataCategoria.nimagen}`
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
    this.dataCategoria.nimagen = nombre;
    await this.updateCategoria(this.categoriaId, this.dataCategoria);
    this.refreshList.emit();
    this.closeModal();
  }

  findByIdCategoria(id: number) {
    this.categoriaService.findById(id).subscribe({
      next: (response) => {
        this.photoSelected = null;
        if (response.nimagen) {
          this.photoSelected = this.urlCategoria + response.nimagen;
        }
        this.dataCategoria = response;
      },
      error: (err) => {
        console.error('Error al guardar:', err);
      },
    });
  }

  updateCategoria(id: number, saveCategoria: CategoriaRequest) {
    this.categoriaService.update(saveCategoria, id).subscribe({
      next: (response) => {
        this.notification.showSuccess('Correcto', 'Exito al Actualizar');
        this.refreshList.emit(); // Emitir evento para refrescar la lista
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
