import { PaginatedRequest } from '@/shared/page/page.request';

export interface ClienteRequest {
  nombre: string;
  apellido: string;
  direccion: string;
  ndocumento: number;
  telefono: number;
}

export interface ClienteFilterRequest extends PaginatedRequest {
  nombre?: string | null;
  apellido?: string | null;
  direccion?: string | null;
  state?: boolean | null;
}

export interface ClienteResponse {
  id: number;
  nombre: string;
  apellido: string;
  direccion: string;
  ndocumento: number;
  telefono: number;
  state: boolean;
}
