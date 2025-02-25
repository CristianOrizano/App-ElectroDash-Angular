export interface LoginRequest {
	username: string;
	password: string;
}

export interface LoginResponse {
	tipoDeToken: string;
	tokenDeAcceso: string;
	expireOn: string;
	usuario: UsuarioResponse;
}
export interface UsuarioResponse {
	id:number
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
