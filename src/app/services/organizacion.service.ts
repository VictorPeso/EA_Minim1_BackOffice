import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Organizacion } from '../models/organizacion.model';
import { environment } from '../../environments/environment';



@Injectable({
  providedIn: 'root',
})
export class OrganizacionService {
  private baseUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  getOrganizaciones(): Observable<any> {
    return this.http.get(
      `${this.baseUrl}/organizaciones`
    );
  }

  getOrganizacionById(id: string): Observable<any> {
    return this.http.get(
      `${this.baseUrl}/organizaciones/${id}`
    );
  }

  createOrganizacion(name: string): Observable<any> {
    return this.http.post(
      `${this.baseUrl}/organizaciones`,
      { name }
    );
  }

  updateOrganizacion(id: string, name: string): Observable<any> {
    return this.http.put(
      `${this.baseUrl}/organizaciones/${id}`,
      { name }
    );
  }

  deleteOrganizacion(id: string): Observable<any> {
    return this.http.delete(
      `${this.baseUrl}/organizaciones/${id}`
    );
  }
}
