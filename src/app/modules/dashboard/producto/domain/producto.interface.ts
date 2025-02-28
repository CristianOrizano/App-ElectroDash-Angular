import { PaginatedRequest } from '@/shared/page/page.request';
import { CategoriaSimpleList } from '../../categoria/domain/categoria.interface';
import { MarcaResponse } from '../../marca/domain/marca.interface';

export interface ProductoRequest {
  descripcion: string;
  stock: number;
  precio: number;
  descuento: number;
  nimagen: string;
  idCategoria: number;
  idMarca: number;
}

export interface ProductoResponse {
  id: number;
  descripcion: string;
  stock: number;
  precio: number;
  descuento: number;
  nimagen: string;
  categoria: CategoriaSimpleList;
  marca: MarcaResponse;
  state: boolean;
}

export interface ProductoFilterRequest extends PaginatedRequest {
  descripcion?: string | null;
  idCategoria?: number | null;
  idMarca?: number | null;
  state?: boolean | null;
}
