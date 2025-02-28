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
import { MarcaService } from '../../../infraestructure/marca.service';
import { NotificationService } from '@/core/services/notification-service';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ImageUploadService } from '@/core/services/image-upload.service';
import { urlmarca } from '@/core/constantes/constantes';
import { MarcaRequest } from '../../../domain/marca.interface';
import { v4 as uuidv4 } from 'uuid';
import { PrimeModule } from '@/shared/prime/prime.module';

@Component({
  selector: 'app-modal-save-marca',
  standalone: true,
  imports: [PrimeModule],
  templateUrl: './modal-save-marca.component.html',
  styleUrl: './modal-save-marca.component.css',
})
export class ModalSaveMarcaComponent implements OnInit, OnChanges {
  @Input() dialog!: boolean;
  @Output() dialogChange = new EventEmitter<boolean>();

  @Input() marcaId!: number;
  @Output() marcaIdChange = new EventEmitter<any>();
  @Output() refreshList = new EventEmitter<void>();

  private marcaService = inject(MarcaService);
  private notification = inject(NotificationService);
  private formBuilder = inject(FormBuilder);
  private imageUploadService = inject(ImageUploadService);

  marcaForm!: FormGroup;
  selectedFile!: File;
  photoSelected!: string | null;
  photoError: boolean = false;
  urlMarca: string = urlmarca;

  ngOnInit(): void {
    this.marcaForm = this.formBuilder.group({
      nombre: ['', [Validators.required]],
      nimagen: [null],
    });
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['marcaId'] && this.marcaId != 0) {
      this.assignForm();
    }
  }
  closeModal() {
    this.photoSelected = null;
    this.photoError = false;
    this.marcaForm.reset();
    this.dialogChange.emit(false);
    this.marcaIdChange.emit(0);
  }

  assignForm() {
    if (this.marcaId !== 0) {
      this.findByIdMarca(this.marcaId);
    }
  }

  async saveMarca() {
    if (this.marcaForm.valid) {
      const saveMarca: MarcaRequest = this.marcaForm.value;

      if (this.marcaId !== 0) {
        // update
        this.updateMarca(this.marcaId, saveMarca);
      } else {
        //create
        if (this.photoSelected != null) {
          const name = uuidv4();
          const filePathNew = `marca/${name}`;
          saveMarca.nimagen = name;
          await this.imageUploadService.uploadImage(
            this.selectedFile,
            filePathNew
          );
        }
        this.createMarca(saveMarca);
      }
      this.closeModal();
    } else {
      this.marcaForm.markAllAsTouched();
    }
  }

  findByIdMarca(id: number) {
    this.marcaService.findById(id).subscribe({
      next: (response) => {
        this.marcaForm.patchValue(response);
      },
      error: (err) => {
        console.error('Error al guardar:', err);
      },
    });
  }

  createMarca(saveMarca: MarcaRequest) {
    this.marcaService.create(saveMarca).subscribe({
      next: (response) => {
        this.notification.showSuccess('Correcto', 'Exito al guardar');
        this.refreshList.emit(); // Emitir evento para refrescar la lista
      },
      error: (err) => {
        console.error('Error al guardar:', err);
      },
    });
  }

  updateMarca(id: number, saveMarca: MarcaRequest) {
    this.marcaService.update(saveMarca, id).subscribe({
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
