import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

import { environment } from '../../../environments/environment';
import { Pagina, Plano, PlanoForm } from '../models';

@Injectable({ providedIn: 'root' })
export class PlanoService {
  private readonly http = inject(HttpClient);
  private readonly url = `${environment.apiUrl}/planos`;

  listar(pagina = 0, tamanho = 20, apenasAtivos = false): Observable<Pagina<Plano>> {
    const params = new HttpParams()
      .set('page', pagina)
      .set('size', tamanho)
      .set('apenasAtivos', apenasAtivos);
    return this.http.get<Pagina<Plano>>(this.url, { params });
  }

  criar(plano: PlanoForm): Observable<Plano> {
    return this.http.post<Plano>(this.url, plano);
  }

  atualizar(id: number, plano: PlanoForm): Observable<Plano> {
    return this.http.put<Plano>(`${this.url}/${id}`, plano);
  }

  /** Tirar de linha não mexe em quem já está matriculado. Reversível. */
  alternarAtivo(id: number): Observable<Plano> {
    return this.http.put<Plano>(`${this.url}/${id}/ativo`, {});
  }
}
