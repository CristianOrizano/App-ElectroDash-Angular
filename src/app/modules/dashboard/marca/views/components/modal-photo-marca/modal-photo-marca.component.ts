import { ImageUploadService } from '@/core/services/image-upload.service';
import { NotificationService } from '@/core/services/notification-service';
import { PrimeModule } from '@/shared/prime/prime.module';
import {
  Component,
  EventEmitter,
  inject,
  Input,
  Output,
  SimpleChanges,
} from '@angular/core';
import { MarcaService } from '../../../infraestructure/marca.service';
import { CategoriaRequest } from '@/modules/dashboard/categoria/domain/categoria.interface';
import { urlmarca } from '@/core/constantes/constantes';
import { MarcaRequest } from '../../../domain/marca.interface';
import { v4 as uuidv4 } from 'uuid';

@Component({
  selector: 'app-modal-photo-marca',
  standalone: true,
  imports: [PrimeModule],
  templateUrl: './modal-photo-marca.component.html',
  styleUrl: './modal-photo-marca.component.css',
})
export class ModalPhotoMarcaComponent {
  @Input() dialog!: boolean;
  @Output() dialogChange = new EventEmitter<boolean>();

  @Input() marcaId!: number;
  @Output() marcaIdChange = new EventEmitter<any>();
  @Output() refreshList = new EventEmitter<void>();

  private notification = inject(NotificationService);
  private imageUploadService = inject(ImageUploadService);
  private marcaService = inject(MarcaService);

  dataMarca!: MarcaRequest;
  urlMarca: string = urlmarca;
  photoError: boolean = false;
  photoSelected!: string | null;
  selectedFile!: File;
  fileSelected: boolean = false;

  ngOnChanges(changes: SimpleChanges) {
    if (changes['marcaId'] && this.marcaId != 0) {
      console.log('CAMBIO>>>>>>>>>');
      this.assignPhoto();
    }
  }

  closeModal() {
    this.fileSelected = false;
    this.photoSelected = null;
    this.photoError = false;
    this.dialogChange.emit(false);
    this.marcaIdChange.emit(0);
  }

  assignPhoto() {
    if (this.marcaId !== 0) {
      this.findByIdMarca(this.marcaId);
    }
  }

  onImageError(event: Event) {
    (event.target as HTMLImageElement).src = 'not-found.png';
  }

  async updateImage() {
    const nombre = uuidv4(); //nombre único para la imagen
    const filePathNew = `marca/${nombre}`;
    const filePathOri = this.dataMarca.nimagen
      ? `marca/${this.dataMarca.nimagen}`
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
    this.dataMarca.nimagen = nombre;
    await this.updateMarca(this.marcaId, this.dataMarca);
    this.refreshList.emit();
    this.closeModal();
  }

  findByIdMarca(id: number) {
    this.marcaService.findById(id).subscribe({
      next: (response) => {
        this.photoSelected = null;
        if (response.nimagen) {
          this.photoSelected = this.urlMarca + response.nimagen;
        }
        this.dataMarca = response;
      },
      error: (err) => {
        console.error('Error al guardar:', err);
      },
    });
  }

  updateMarca(id: number, saveMarca: MarcaRequest) {
    this.marcaService.update(saveMarca, id).subscribe({
      next: () => {
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
