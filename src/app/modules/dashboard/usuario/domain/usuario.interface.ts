import { PaginatedRequest } from '@/shared/page/page.request';

export interface UsuarioResponse {
  id: number;
  nombre: string;
  apellido: string;
  nimagen: string;
  username: string;
  password: string;
  roles: RoleResponse[];
}

export interface RoleResponse {
  id: number;
  nombre: string;
}

export interface UsuarioFilterRequest extends PaginatedRequest {
  nombre?: string | null;
  apellido?: string | null;
  state?: boolean | null;
}

export interface UsuarioRequest {
  nombre: string;
  apellido: string;
  nimagen: string;
  username: string;
  password: string;
  roles: number[];
}
