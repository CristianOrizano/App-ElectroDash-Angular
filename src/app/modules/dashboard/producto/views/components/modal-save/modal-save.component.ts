import {
  Component,
  EventEmitter,
  inject,
  Input,
  OnChanges,
  OnInit,
  Output,
  SimpleChanges,
} from '@angular/core';
import { ProductoService } from '../../../infraestructure/producto.service';
import { NotificationService } from '@/core/services/notification-service';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ImageUploadService } from '@/core/services/image-upload.service';
import { urlproducto } from '@/core/constantes/constantes';
import { PrimeModule } from '@/shared/prime/prime.module';
import { CategoriaService } from '@/modules/dashboard/categoria/infraestructure/categoria.service';
import { CategoriaResponse } from '@/modules/dashboard/categoria/domain/categoria.interface';
import { ProductoRequest } from '../../../domain/producto.interface';
import { v4 as uuidv4 } from 'uuid';

@Component({
  selector: 'app-modal-save',
  standalone: true,
  imports: [PrimeModule],
  templateUrl: './modal-save.component.html',
  styleUrl: './modal-save.component.css',
})
export class ModalSaveComponent implements OnInit, OnChanges {
  @Input() dialog!: boolean;
  @Output() dialogChange = new EventEmitter<boolean>();

  @Input() productoId!: number;
  @Output() productoIdChange = new EventEmitter<any>();
  @Output() refreshList = new EventEmitter<void>();

  private categoriaService = inject(CategoriaService);
  private productoService = inject(ProductoService);
  private notification = inject(NotificationService);
  private formBuilder = inject(FormBuilder);
  private imageUploadService = inject(ImageUploadService);

  productoForm!: FormGroup;
  selectedFile!: File;
  photoSelected!: string | null;
  photoError: boolean = false;
  urlProducto: string = urlproducto;
  listCategoria!: CategoriaResponse[];

  ngOnInit() {
    this.findAllCategoria();
    this.productoForm = this.formBuilder.group({
      descripcion: ['', [Validators.required]],
      idCategoria: [null, Validators.required],
      marca: ['', Validators.required],
      precio: [null, Validators.required],
      stock: [null, Validators.required],
      nimagen: [null],
    });
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['productoId'] && this.productoId != 0) {
      this.assignForm();
    }
  }

  closeModal() {
    this.photoSelected = null;
    this.photoError = false;
    this.productoForm.reset();
    this.dialogChange.emit(false);
    this.productoIdChange.emit(0);
  }

  assignForm() {
    if (this.productoId !== 0) {
      this.findByIdProducto(this.productoId);
    }
  }

  async saveCategoria() {
    if (this.productoForm.valid) {
      const saveProducto: ProductoRequest = this.productoForm.value;
      if (this.productoId !== 0) {
        // update
        this.updateProducto(this.productoId, saveProducto);
      } else {
        //create
        if (this.photoSelected != null) {
          const name = uuidv4();
          const filePathNew = `producto/${name}`;
          saveProducto.nimagen = name;
          await this.imageUploadService.uploadImage(
            this.selectedFile,
            filePathNew
          );
        }
        this.createProducto(saveProducto);
      }
      this.closeModal();
    } else {
      this.productoForm.markAllAsTouched();
    }
  }

  findByIdProducto(id: number) {
    this.productoService.findById(id).subscribe({
      next: (response) => {
        if (response.nimagen !== null) {
          this.photoSelected = urlproducto + response.nimagen;
        }
        this.productoForm.patchValue(response);
        this.productoForm.get('idCategoria')?.setValue(response.categoria.id);
      },
      error: (err) => {
        console.error('Error al guardar:', err);
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

  createProducto(saveProducto: ProductoRequest) {
    this.productoService.create(saveProducto).subscribe({
      next: (response) => {
        this.notification.showSuccess('Correcto', 'Exito al guardar');
        this.refreshList.emit(); // Emitir evento para refrescar la lista
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
    const validTypes = ['image/png', 'image/jpeg', 'image/jpg'];
    if (this.selectedFile) {
      this.photoError = !validTypes.includes(this.selectedFile.type);
      this.photoSelected = this.photoError
        ? null
        : URL.createObjectURL(this.selectedFile);
    } else {
      this.photoSelected = null;
      this.photoError = false;
    }
  }
}
