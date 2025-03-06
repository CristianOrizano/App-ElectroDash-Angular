import { LoginResponse } from '@/modules/auth/domain/auth.interface';
import { AuthService } from '@/modules/auth/infraestructure/auth.service';
import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);

  // Si el token ha expirado, eliminarlo y evitar la solicitud
  if (authService.isTokenExpired()) {
    console.warn('Token expirado. Cerrando sesión...');
    authService.removeAuthorization();

    return next(req);
  }

  const authToken: LoginResponse | null = authService.getAuthorization();
  if (authToken != null) {
    // Clona la solicitud y agrega el encabezado de autorización
    const authReq = req.clone({
      setHeaders: {
        Authorization: `Bearer ${authToken?.tokenDeAcceso}`,
      },
    });

    return next(authReq);
  }

  return next(req);
};
