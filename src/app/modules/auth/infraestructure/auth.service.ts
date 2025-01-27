import { inject, Injectable } from '@angular/core';
import { environment } from '../../../../environments/environment';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { LoginRequest, LoginResponse } from '../domain/auth.interface';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private baseUrl: string = environment.apiUrl;
  private http = inject(HttpClient); // Uso de inject en lugar de constructor

  //generamos el token
  public generateToken(loginData: LoginRequest): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(
      `${this.baseUrl}/api/login`,
      loginData
    );
  }

  //iniciamos sesión y establecemos el token en el localStorage
  public saveAuthorization(token: LoginResponse) {
    localStorage.setItem('STORAGE_OF_AUTHORIZATION', JSON.stringify(token));
    return true;
  }

  // Obtener el token desde el localStorage
  public getAuthorization(): LoginResponse | null {
    const token = localStorage.getItem('STORAGE_OF_AUTHORIZATION');
    if (token) {
      return JSON.parse(token); // Parseamos el string a un objeto LoginResponse
    } else {
      return null; // Si no existe, retornamos null
    }
  }

  public removeAuthorization(): void {
    localStorage.removeItem('STORAGE_OF_AUTHORIZATION');
  }

  public existsAuthorization(): boolean {
    const token = localStorage.getItem('STORAGE_OF_AUTHORIZATION');
    return token !== null; // Si el token es null, significa que no existe
  }
}
