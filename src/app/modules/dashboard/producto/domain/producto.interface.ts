import { CategoriaSimpleList } from '../../categoria/domain/categoria.interface';

export interface ProductoRequest {
  descripcion: string;
  stock: number;
  precio: number;
  descuento: number;
  marca: string;
  nimagen: string;
  idCategoria: number;
}

export interface ProductoResponse {
  id: number;
  descripcion: string;
  stock: number;
  precio: number;
  descuento: number;
  marca: string;
  nimagen: string;
  categoria: CategoriaSimpleList;
  state: boolean;
}
