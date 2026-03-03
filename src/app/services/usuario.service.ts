import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class UsuarioService {

  private baseUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}
  
  getUsuarios(): Observable<any> {
    return this.http.get(
      `${this.baseUrl}/usuarios`
    );
  }

  getOrganizaciones(): Observable<any> {
    return this.http.get(
      `${this.baseUrl}/organizaciones`
    );
  }



  getUsuarioById(id: string): Observable<any> {
    return this.http.get(
      `${this.baseUrl}/usuarios/${id}`
    );
  }

  createUsuario(name: string, organizacion: string): Observable<any> {
    return this.http.post(
      `${this.baseUrl}/usuarios`,
      { name, organizacion }
    );
  }

  updateUsuario(id: string, name: string, organizacion: string): Observable<any> {
    return this.http.put(
      `${this.baseUrl}/usuarios/${id}`,
      { name, organizacion }
    );
  }

  deleteUsuario(id: string): Observable<any> {
    return this.http.delete(
      `${this.baseUrl}/usuarios/${id}`
    );
  }
}
