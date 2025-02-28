import { ImageUploadService } from '@/core/services/image-upload.service';
import { NotificationService } from '@/core/services/notification-service';
import {
  Component,
  EventEmitter,
  inject,
  Input,
  OnChanges,
  Output,
  SimpleChanges,
} from '@angular/core';
import { ProductoService } from '../../../infraestructure/producto.service';
import {
  ProductoRequest,
  ProductoResponse,
} from '../../../domain/producto.interface';
import { urlproducto } from '@/core/constantes/constantes';
import { v4 as uuidv4 } from 'uuid';
import { PrimeModule } from '@/shared/prime/prime.module';

@Component({
  selector: 'app-modal-photo-producto',
  standalone: true,
  imports: [PrimeModule],
  templateUrl: './modal-photo-producto.component.html',
  styleUrl: './modal-photo-producto.component.css',
})
export class ModalPhotoProductoComponent implements OnChanges {
  @Input() dialog!: boolean;
  @Output() dialogChange = new EventEmitter<boolean>();

  @Input() productoId!: number;
  @Output() productoIdChange = new EventEmitter<any>();
  @Output() refreshList = new EventEmitter<void>();

  private notification = inject(NotificationService);
  private imageUploadService = inject(ImageUploadService);
  private productoService = inject(ProductoService);

  dataProducto!: ProductoRequest;
  urlProducto: string = urlproducto;
  photoError: boolean = false;
  photoSelected!: string | null;
  selectedFile!: File;
  fileSelected: boolean = false;

  ngOnChanges(changes: SimpleChanges) {
    if (changes['productoId'] && this.productoId != 0) {
      this.assignPhoto();
    }
  }

  closeModal() {
    this.fileSelected = false;
    this.photoSelected = null;
    this.photoError = false;
    this.dialogChange.emit(false);
    this.productoIdChange.emit(0);
  }

  assignPhoto() {
    if (this.productoId !== 0) {
      this.findByIdProducto(this.productoId);
    }
  }

  onImageError(event: Event) {
    (event.target as HTMLImageElement).src = 'not-found.png';
  }

  async updateImage() {
    const nombre = uuidv4(); //nombre único para la imagen
    const filePathNew = `producto/${nombre}`;
    const filePathOri = this.dataProducto.nimagen
      ? `producto/${this.dataProducto.nimagen}`
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
    this.dataProducto.nimagen = nombre;
    await this.updateProducto(this.productoId, this.dataProducto);
    this.refreshList.emit();
    this.closeModal();
  }

  findByIdProducto(id: number) {
    this.productoService.findById(id).subscribe({
      next: (response) => {
        this.photoSelected = null;
        if (response.nimagen) {
          this.photoSelected = this.urlProducto + response.nimagen;
        }
        this.dataProducto = {
          descuento: response.descuento,
          descripcion: response.descripcion,
          idCategoria: response.categoria.id,
          idMarca: response.marca.id,
          precio: response.precio,
          stock: response.stock,
          nimagen: response.nimagen,
        };
      },
      error: (err) => {
        console.error('Error al guardar:', err);
      },
    });
  }

  updateProducto(id: number, saveProducto: ProductoRequest) {
    this.productoService.update(saveProducto, id).subscribe({
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
