import { Routes } from '@angular/router';

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
      },
      {
        path: 'categoria',
        loadComponent: () =>
          import(
            './modules/dashboard/categoria/views/categoria.component'
          ).then((m) => m.CategoriaComponent),
      },
      {
        path: 'producto',
        loadComponent: () =>
          import('./modules/dashboard/producto/views/producto.component').then(
            (m) => m.ProductoComponent
          ),
      },
      {
        path: 'cliente',
        loadComponent: () =>
          import('./modules/dashboard/cliente/views/cliente.component').then(
            (m) => m.ClienteComponent
          ),
      },
      {
        path: 'registrar-venta',
        loadComponent: () =>
          import(
            './modules/dashboard/venta/views/registrar-venta/registrar-venta.component'
          ).then((m) => m.RegistrarVentaComponent),
      },
      {
        path: 'perfil',
        loadComponent: () =>
          import('./modules/dashboard/perfil/perfil-usuario.component').then(
            (m) => m.PerfilUsuarioComponent
          ),
      },
      { path: '', redirectTo: 'home', pathMatch: 'full' },
    ],
  },

  {
    path: '**',
    redirectTo: 'login',
  },
];
