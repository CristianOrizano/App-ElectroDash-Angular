import { PrimeModule } from '@/shared/prime/prime.module';
import { Component, inject, OnInit } from '@angular/core';

import { FormBuilder, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../infraestructure/auth.service';
import { NotificationService } from '@/core/services/notification-service';
import { LoginRequest } from '../domain/auth.interface';

@Component({
  selector: 'app-auth',
  standalone: true,
  imports: [PrimeModule],
  templateUrl: './auth.component.html',
  styleUrl: './auth.component.css',
})
export class AuthComponent implements OnInit {
  private authService = inject(AuthService);
  private formBuilder = inject(FormBuilder);
  private notificationService = inject(NotificationService);
  private router = inject(Router);
  loading: boolean = false;

  ngOnInit(): void {}

  loginForm = this.formBuilder.group({
    username: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(3)]],
  });

  login(loginData: LoginRequest) {
    this.authService.generateToken(loginData).subscribe({
      next: (response) => {
        this.authService.saveAuthorization(response);
      },
      error: (err) => {
        console.error('Error de inicio de sesión:', err);
      },
    });
  }

  onSubmit(): void {
    if (this.loginForm.valid) {
      this.authService
        .generateToken(this.loginForm.value as LoginRequest)
        .subscribe({
          next: (response) => {
            this.loading = true;
            this.authService.saveAuthorization(response);
            setTimeout(() => {
              // this.loading = false;
              this.router.navigate(['dashboard']);
              this.notificationService.showSuccess(
                'Exito',
                'Sesion iniciada con exito'
              );
            }, 4000); // 4000 ms = 4 segundos
          },
          error: (err) => {
            this.notificationService.showError(
              'Error de inicio de sesión',
              err.error.message
            );
          },
        });
    } else {
      // Marcar todos los campos como tocados
      this.loginForm.markAllAsTouched();
    }
  }
}
