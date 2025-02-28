import { PaginatedRequest } from '@/shared/page/page.request';

export interface MarcaRequest {
  nombre: string;
  nimagen: string;
}

export interface MarcaFilterRequest extends PaginatedRequest {
  nombre?: string | null;
  state?: boolean | null;
}

export interface MarcaResponse {
  id: number;
  nombre: string;
  nimagen: string;
  state: boolean;
}
