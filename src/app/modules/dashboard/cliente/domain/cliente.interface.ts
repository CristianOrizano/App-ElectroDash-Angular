export interface ClienteRequest {
  nombre: string;
  apellido: string;
  direccion: string;
  ndocumento: number;
  telefono: number;
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
