import { Component, inject, OnInit, ViewChild } from '@angular/core';
import { MenuItem } from 'primeng/api';
import { Sidebar } from 'primeng/sidebar';
import { Router, RouterOutlet } from '@angular/router';
import { PrimeModule } from '../prime/prime.module';
import { AuthService } from '@/modules/auth/infraestructure/auth.service';
import { LoginResponse } from '@/modules/auth/domain/auth.interface';
import { OverlayPanel } from 'primeng/overlaypanel';

import { urlproducto, urlusuario } from '@/core/constantes/constantes';
import {
  NotificacionProductoService,
  NotificacionResponse,
} from '@/core/services/notificacion.producto.service';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [PrimeModule, RouterOutlet],
  templateUrl: './navbar.component.html',
  styleUrl: './navbar.component.css',
})
export class NavbarComponent implements OnInit {
  private authService = inject(AuthService);
  private router = inject(Router);
  private notificacionService = inject(NotificacionProductoService);

  auth!: LoginResponse | null;
  urlProducto: string = urlproducto;
  items: MenuItem[] | undefined;
  sidebarVisible: boolean = false;
  @ViewChild('sidebarRef') sidebarRef!: Sidebar;
  @ViewChild('overlayPanel') overlayPanel!: OverlayPanel;
  hayNotificacion: boolean = false;
  notificaciones: NotificacionResponse[] = [];
  urlUsuario: string = urlusuario;
  isUser: boolean = false;

  closeCallback(e: any): void {
    this.sidebarRef.close(e);
  }

  logout() {
    this.router.navigate(['login']);
    this.authService.removeAuthorization();
  }

  ngOnInit() {
    this.auth = this.authService.getAuthorization();

    if (this.auth && this.auth.usuario.roles) {
      const roles = this.auth.usuario.roles.map((role) => role.nombre);

      // Verifica si el usuario tiene solo el rol "User" y no "Admin"
      this.isUser = roles.includes('User') && !roles.includes('Admin');
    }

    this.notificacionService.findAllNotificacion();
    this.notificacionService.notificaciones$.subscribe((data) => {
      this.notificaciones = data;
    });
  }

  toggleNotificaciones(event: Event) {
    this.overlayPanel.toggle(event);
    this.hayNotificacion = false; // Deja de parpadear cuando se abre el panel
  }

  marcarComoLeida(notificacion: NotificacionResponse) {
    if (!notificacion.state) return;
    this.notificacionService.delete(notificacion.id).subscribe({
      next: () => {
        // Marcar como leida en el frontend
        this.notificaciones = this.notificaciones.filter(
          (n) => n.id !== notificacion.id
        );
      },
      error: (error) => {
        console.error('Error al marcar como leída:', error);
      },
    });
  }

  onImageError(event: Event) {
    (event.target as HTMLImageElement).src = 'not-found.png';
  }
}
