import { Routes } from '@angular/router';
import { authGuard } from './core/guard/auth.guard';

export const routes: Routes = [
  {
    path: 'login',
    loadComponent: () =>
      import('./modules/auth/views/auth.component').then(
        (m) => m.AuthComponent
      ),
  },
  {
    path: 'dashboard',
    loadComponent: () =>
      import('./shared/navbar/navbar.component').then((m) => m.NavbarComponent),
    children: [
      {
        path: 'home',
        loadComponent: () =>
          import('./modules/dashboard/home/home.component').then(
            (m) => m.HomeComponent
          ),
        canActivate: [authGuard],
      },
      {
        path: 'categoria',
        loadComponent: () =>
          import(
            './modules/dashboard/categoria/views/categoria.component'
          ).then((m) => m.CategoriaComponent),
        canActivate: [authGuard],
        data: { roles: ['Admin'] },
      },
      {
        path: 'marca',
        loadComponent: () =>
          import('./modules/dashboard/marca/views/marca.component').then(
            (m) => m.MarcaComponent
          ),
        canActivate: [authGuard],
        data: { roles: ['Admin'] },
      },
      {
        path: 'producto',
        loadComponent: () =>
          import('./modules/dashboard/producto/views/producto.component').then(
            (m) => m.ProductoComponent
          ),
        canActivate: [authGuard],
        data: { roles: ['Admin'] },
      },
      {
        path: 'usuario',
        loadComponent: () =>
          import('./modules/dashboard/usuario/views/usuario.component').then(
            (m) => m.UsuarioComponent
          ),
        canActivate: [authGuard],
        data: { roles: ['Admin'] },
      },
      {
        path: 'cliente',
        loadComponent: () =>
          import('./modules/dashboard/cliente/views/cliente.component').then(
            (m) => m.ClienteComponent
          ),
        canActivate: [authGuard],
      },
      {
        path: 'registrar-venta',
        loadComponent: () =>
          import(
            './modules/dashboard/venta/views/registrar-venta/registrar-venta.component'
          ).then((m) => m.RegistrarVentaComponent),
        canActivate: [authGuard],
      },
      {
        path: 'listar-venta',
        loadComponent: () =>
          import(
            './modules/dashboard/venta/views/listar-venta/listar-venta.component'
          ).then((m) => m.ListarVentaComponent),
        canActivate: [authGuard],
      },
      {
        path: 'reporte-venta',
        loadComponent: () =>
          import(
            './modules/dashboard/reporte/reporte-venta/reporte-venta.component'
          ).then((m) => m.ReporteVentaComponent),
        canActivate: [authGuard],
        data: { roles: ['Admin'] },
      },
      {
        path: 'reporte-inventario',
        loadComponent: () =>
          import(
            './modules/dashboard/reporte/reporte-inventario/reporte-inventario.component'
          ).then((m) => m.ReporteInventarioComponent),
        canActivate: [authGuard],
        data: { roles: ['Admin'] },
      },
      {
        path: 'perfil',
        loadComponent: () =>
          import('./modules/dashboard/perfil/perfil-usuario.component').then(
            (m) => m.PerfilUsuarioComponent
          ),
        canActivate: [authGuard],
      },
      { path: '', redirectTo: 'home', pathMatch: 'full' },
    ],
  },
  {
    path: '404',
    loadComponent: () =>
      import('./shared/page/page-not-found/page-not-found.component').then(
        (m) => m.PageNotFoundComponent
      ),
  },
  {
    path: '403',
    loadComponent: () =>
      import('./shared/page/access-denied/access-denied.component').then(
        (m) => m.AccessDeniedComponent
      ),
  },
  {
    path: '**',
    redirectTo: '404',
  },
];
