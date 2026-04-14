import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Faq } from '../models/faq.model';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class FaqService {
  private readonly http = inject(HttpClient);

  private readonly apiUrl = environment.apiUrl + '/faqs';

  getFaq(): Observable<Faq[]> {
    return this.http.get<Faq[]>(this.apiUrl);
  }

  getAllFaq(): Observable<Faq[]> {
    return this.http.get<Faq[]>(`${this.apiUrl}/all`);
  }

  getFaqById(faqId: string): Observable<Faq> {
    return this.http.get<Faq>(`${this.apiUrl}/${faqId}`);
  }

  createFaq(faq: Faq): Observable<Faq> {
    return this.http.post<Faq>(this.apiUrl, faq);
  }

  updateFaq(faqId: string, faq: Partial<Faq>): Observable<Faq> {
    return this.http.put<Faq>(`${this.apiUrl}/${faqId}`, faq);
  }

  softDeleteFaq(faqId: string, faqActual: Faq): Observable<Faq> {
    return this.http.put<Faq>(`${this.apiUrl}/${faqId}`, {
      ...faqActual,
      IsDeleted: true,
    });
  }

  restoreFaq(faqId: string, faqActual: Faq): Observable<Faq> {
    return this.http.put<Faq>(`${this.apiUrl}/restore/${faqId}`, {
      ...faqActual,
      IsDeleted: false,
    });
  }

  permanentDeleteFaq(faqId: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/permanent/${faqId}`);
  }
}
