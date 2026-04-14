import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import { Resposta } from '../models/resposta.model';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class RespostaService {
  private readonly http = inject(HttpClient);

  private readonly apiUrl = `${environment.apiUrl}/respostas`;

  getRespostas(): Observable<Resposta[]> {
    return this.http.get<Resposta[]>(this.apiUrl);
  }

  getAllRespostas(): Observable<Resposta[]> {
    return this.http.get<Resposta[]>(`${this.apiUrl}/all`);
  }

  getRespostaById(respostaId: string): Observable<Resposta> {
    return this.http.get<Resposta>(`${this.apiUrl}/${respostaId}`);
  }

  createResposta(resposta: Resposta): Observable<Resposta> {
    return this.http.post<Resposta>(this.apiUrl, resposta);
  }

  updateResposta(respostaId: string, resposta: Partial<Resposta>): Observable<Resposta> {
    return this.http.put<Resposta>(`${this.apiUrl}/${respostaId}`, resposta);
  }

  softDeleteResposta(respostaId: string): Observable<Resposta> {
    return this.http.put<Resposta>(`${this.apiUrl}/${respostaId}`, {
      IsDeleted: true,
    });
  }

  restoreResposta(respostaId: string): Observable<Resposta> {
    return this.http.put<Resposta>(`${this.apiUrl}/restore/${respostaId}`, {
      IsDeleted: false,
    });
  }

  permanentDeleteResposta(respostaId: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/permanent/${respostaId}`);
  }
}
