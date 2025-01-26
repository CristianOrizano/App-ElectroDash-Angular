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

export interface CategoriaSimpleList {
  id: number;
  nombre: string;
}