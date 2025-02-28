import { PrimeModule } from '@/shared/prime/prime.module';
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
import { v4 as uuidv4 } from 'uuid';
import { CategoriaService } from '../../../infraestructure/categoria.service';
import { NotificationService } from '@/core/services/notification-service';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ImageUploadService } from '@/core/services/image-upload.service';
import { urlcategoria } from '@/core/constantes/constantes';
import { CategoriaRequest } from '../../../domain/categoria.interface';

@Component({
  selector: 'app-categoria-modal',
  standalone: true,
  imports: [PrimeModule],
  templateUrl: './categoria-modal.component.html',
  styleUrl: './categoria-modal.component.css',
})
export class CategoriaModalComponent implements OnInit, OnChanges {
  @Input() dialog!: boolean;
  @Output() dialogChange = new EventEmitter<boolean>();

  @Input() categoriaId!: number;
  @Output() categoriaIdChange = new EventEmitter<any>();
  @Output() refreshList = new EventEmitter<void>();

  private categoriaService = inject(CategoriaService);
  private notification = inject(NotificationService);
  private formBuilder = inject(FormBuilder);
  private imageUploadService = inject(ImageUploadService);

  categoriaForm!: FormGroup;
  selectedFile!: File;
  photoSelected!: string | null;
  photoError: boolean = false;
  urlCategoria: string = urlcategoria;

  ngOnInit(): void {
    this.categoriaForm = this.formBuilder.group({
      nombre: ['', [Validators.required]],
      descripcion: ['', [Validators.required]],
      nimagen: [null],
    });
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['categoriaId'] && this.categoriaId != 0) {
      console.log('CAMBIO>>>>>>>>>');
      this.assignForm();
    }
  }

  closeModal() {
    this.photoSelected = null;
    this.photoError = false;
    this.categoriaForm.reset();
    this.dialogChange.emit(false);
    this.categoriaIdChange.emit(0);
  }

  assignForm() {
    if (this.categoriaId !== 0) {
      this.findByIdCategoria(this.categoriaId);
    }
  }

  async saveCategoria() {
    if (this.categoriaForm.valid) {
      const saveCategoria: CategoriaRequest = this.categoriaForm.value;
      console.log('VALOR ENVIADO', saveCategoria);
      if (this.categoriaId !== 0) {
        // update
        this.updateCategoria(this.categoriaId, saveCategoria);
      } else {
        //create
        if (this.photoSelected != null) {
          const name = uuidv4();
          const filePathNew = `categoria/${name}`;
          saveCategoria.nimagen = name;
          await this.imageUploadService.uploadImage(
            this.selectedFile,
            filePathNew
          );
        }
        this.createCategoria(saveCategoria);
      }
      this.closeModal();
    } else {
      this.categoriaForm.markAllAsTouched();
    }
  }

  findByIdCategoria(id: number) {
    this.categoriaService.findById(id).subscribe({
      next: (response) => {
        this.categoriaForm.patchValue(response);
      },
      error: (err) => {
        console.error('Error al guardar:', err);
      },
    });
  }

  createCategoria(saveCategoria: CategoriaRequest) {
    this.categoriaService.create(saveCategoria).subscribe({
      next: (response) => {
        this.notification.showSuccess('Correcto', 'Exito al guardar');
        this.refreshList.emit(); // Emitir evento para refrescar la lista
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
