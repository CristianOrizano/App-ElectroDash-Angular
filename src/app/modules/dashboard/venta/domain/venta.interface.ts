export interface CarritoSave {
  id: number;
  nimagen: string;
  descripcion: string;
  precio: number;
  cantidad: number;
  subTotal: number;
}

export interface VentaRequest {
  fechaEmision: string; // O Date si deseas manejarlo como objeto Date
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
