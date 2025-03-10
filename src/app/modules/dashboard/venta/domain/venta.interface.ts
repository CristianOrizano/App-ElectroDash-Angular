import { UsuarioResponse } from '@/modules/auth/domain/auth.interface';
import { ClienteResponse } from '../../cliente/domain/cliente.interface';
import { ProductoResponse } from '../../producto/domain/producto.interface';
import { PaginatedRequest } from '@/shared/page/page.request';

export interface CarritoSave {
  id: number;
  nimagen: string;
  descripcion: string;
  precio: number;
  cantidad: number;
  subTotal: number;
}

export interface VentaRequest {
  idCliente: number;
  idUsuario: number;
  tipoVenta: string;
  total: number;
  detalles: DetalleVentaRequest[];
}

export interface DetalleVentaRequest {
  idProducto: number;
  cantidad: number;
}

export interface BoletaResponse {
  id: number;
  fechaEmision: string;
  cliente: ClienteResponse;
  usuario: UsuarioResponse;
  tipoVenta: string;
  total: number;
}

export interface BoletaFilterRequest extends PaginatedRequest {
  fechaInicio?: string | null;
  fechaFin?: string | null;
  tipoVenta?: string | null;
  idUsuario?: number | null;
}

export interface DetalleBoletaResponse {
  id: number;
  cantidad: number;
  boleta: BoletaResponse;
  producto: ProductoResponse;
}

export interface BoletaFilterFechas {
  fechaInicio: string;
  fechaFin: string;
}
