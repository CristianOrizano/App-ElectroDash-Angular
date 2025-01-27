import { LoginResponse } from '@/modules/auth/domain/auth.interface';
import { AuthService } from '@/modules/auth/infraestructure/auth.service';
import { PrimeModule } from '@/shared/prime/prime.module';
import { Component, inject } from '@angular/core';

@Component({
  selector: 'app-perfil-usuario',
  standalone: true,
  imports: [PrimeModule],
  templateUrl: './perfil-usuario.component.html',
  styleUrl: './perfil-usuario.component.css',
})
export class PerfilUsuarioComponent {
  private authService = inject(AuthService);
  auth!: LoginResponse | null;
  tableData: { campo: string; dato: any }[] = [];

  ngOnInit() {
    this.auth = this.authService.getAuthorization();
    if (this.auth && this.auth.usuario) {
      const roles = this.auth.usuario.roles.map((role) => role.nombre).join(', ');
      this.tableData = [
        { campo: 'ID', dato: this.auth.usuario.id },
        { campo: 'Nombre', dato: this.auth.usuario.nombre },
        { campo: 'Apellido', dato: this.auth.usuario.apellido },
        { campo: 'Rol', dato: roles },
        { campo: 'Username', dato: this.auth.usuario.username },
        { campo: 'Password', dato: this.auth.usuario.password },
      ];
    }
  }
}
