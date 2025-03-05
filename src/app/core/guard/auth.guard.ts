import { AuthService } from '@/modules/auth/infraestructure/auth.service';
import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';

export const authGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  // Verificar si el usuario está autenticado
  if (!authService.existsAuthorization()) {
    router.navigate(['/login']);
    return false;
  }
  const token = authService.getAuthorization();
  const userRoles = token?.usuario?.roles?.map((role) => role.nombre) || [];
  const allowedRoles = route.data['roles'] as string[];

  if (allowedRoles && !userRoles.some((role) => allowedRoles.includes(role))) {
    router.navigate(['/403']);
    return false;
  }

  return true;
};
