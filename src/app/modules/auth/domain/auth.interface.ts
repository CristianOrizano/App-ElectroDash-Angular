import { RoleResponse } from '@/modules/dashboard/usuario/domain/usuario.interface';

export interface LoginRequest {
  username: string;
  password: string;
}

export interface LoginResponse {
  tipoDeToken: string;
  tokenDeAcceso: string;
  expiresOn: string;
  usuario: UsuarioResponse;
}
export interface UsuarioResponse {
  id: number;
  nombre: string;
  apellido: string;
  nimagen: string;
  username: string;
  password: string;
  roles: RoleResponse[];
}
