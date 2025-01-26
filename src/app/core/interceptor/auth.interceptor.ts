import { LoginResponse } from '@/modules/auth/domain/auth.interface';
import { AuthService } from '@/modules/auth/infraestructure/auth.service';
import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';


export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);

  const authToken: LoginResponse | null = authService.getAuthorization(); 
  if (authToken != null) {
    // Clona la solicitud y agrega el encabezado de autorización
    const authReq = req.clone({
      setHeaders: {
        Authorization: `Bearer ${authToken?.tokenDeAcceso}`,
      },
    });
    // Envía la solicitud clonada con el encabezado de autorización
    return next(authReq);
  }else{
    console.log("entro vacio")
  }
  // Si no hay token, envía la solicitud original
  return next(req);
};
