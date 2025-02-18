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
import { ClienteService } from '../../../infraestructure/cliente.service';
import { NotificationService } from '@/core/services/notification-service';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ClienteRequest } from '../../../domain/cliente.interface';

@Component({
  selector: 'app-cliente-save-modal',
  standalone: true,
  imports: [PrimeModule],
  templateUrl: './cliente-save-modal.component.html',
  styleUrl: './cliente-save-modal.component.css',
})
export class ClienteSaveModalComponent implements OnInit, OnChanges {
  @Input() dialog!: boolean;
  @Output() dialogChange = new EventEmitter<boolean>();

  @Input() clienteId!: number;
  @Output() clienteIdChange = new EventEmitter<any>();
  @Output() refreshList = new EventEmitter<void>();

  private clienteService = inject(ClienteService);
  private notification = inject(NotificationService);
  private formBuilder = inject(FormBuilder);

  clienteForm!: FormGroup;

  ngOnInit(): void {
    this.clienteForm = this.formBuilder.group({
      nombre: ['', [Validators.required]],
      apellido: ['', [Validators.required]],
      direccion: ['', [Validators.required]],
      ndocumento: [null, [Validators.required]],
      telefono: [null, [Validators.required]],
    });
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['clienteId'] && this.clienteId != 0) {
      this.assignForm();
    }
  }

  closeModal() {
    this.clienteForm.reset();
    this.dialogChange.emit(false);
    this.clienteIdChange.emit(0);
  }

  assignForm() {
    if (this.clienteId !== 0) {
      this.findByIdCliente(this.clienteId);
    }
  }

  async saveCliente() {
    if (this.clienteForm.valid) {
      const saveCliente: ClienteRequest = this.clienteForm.value;
      console.log('VALOR ENVIADO', saveCliente);
      if (this.clienteId !== 0) {
        // update
        this.updateCliente(this.clienteId, saveCliente);
      } else {
        this.createCliente(saveCliente);
      }
      this.closeModal();
    } else {
      this.clienteForm.markAllAsTouched();
    }
  }

  findByIdCliente(id: number) {
    this.clienteService.findById(id).subscribe({
      next: (response) => {
        this.clienteForm.patchValue(response);
      },
      error: (err) => {
        console.error('Error al guardar:', err);
      },
    });
  }

  createCliente(saveCliente: ClienteRequest) {
    this.clienteService.create(saveCliente).subscribe({
      next: (response) => {
        this.notification.showSuccess('Correcto', 'Exito al guardar');
        this.refreshList.emit(); // Emitir evento para refrescar la lista
      },
      error: (err) => {
        console.error('Error al guardar:', err);
      },
    });
  }

  updateCliente(id: number, saveCliente: ClienteRequest) {
    this.clienteService.update(saveCliente, id).subscribe({
      next: (response) => {
        this.notification.showSuccess('Correcto', 'Exito al Actualizar');
        this.refreshList.emit(); // Emitir evento para refrescar la lista
      },
      error: (err) => {
        console.error('Error al guardar:', err);
      },
    });
  }
}
