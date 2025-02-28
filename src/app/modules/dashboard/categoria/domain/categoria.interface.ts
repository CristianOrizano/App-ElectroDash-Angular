import { PaginatedRequest } from '@/shared/page/page.request';

export interface CategoriaRequest {
  nombre: string;
  descripcion: string;
  nimagen: string;
}

export interface CategoriaResponse {
  id: number;
  nombre: string;
  descripcion: string;
  nimagen: string;
  state: boolean;
}

export interface CategoriaFilterRequest extends PaginatedRequest {
  nombre?: string | null;
  descripcion?: string | null;
  state?: boolean | null;
}

export interface CategoriaSimpleList {
  id: number;
  nombre: string;
}
