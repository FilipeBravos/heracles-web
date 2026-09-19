import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

import { environment } from '../../../environments/environment';
import { Notificacao, Pagina, ResumoNotificacoes } from '../models';

/**
 * A central de notificações de quem está autenticado.
 *
 * Sob /api/eu — o mesmo padrão de "meus dados" e "minha matrícula":
 * o backend decide de quem são as notificações pelo token, nunca por
 * um id que esta chamada mandasse.
 */
@Injectable({ providedIn: 'root' })
export class NotificacaoService {
  private readonly http = inject(HttpClient);
  private readonly url = `${environment.apiUrl}/eu/notificacoes`;

  listar(pagina = 0, tamanho = 20): Observable<Pagina<Notificacao>> {
    const params = new HttpParams().set('page', pagina).set('size', tamanho);
    return this.http.get<Pagina<Notificacao>>(this.url, { params });
  }

  /** Contagem de não lidas — o número que o sino mostra sem abrir a lista. */
  resumo(): Observable<ResumoNotificacoes> {
    return this.http.get<ResumoNotificacoes>(`${this.url}/resumo`);
  }

  marcarComoLida(id: number): Observable<void> {
    return this.http.put<void>(`${this.url}/${id}/lida`, {});
  }

  marcarTodasComoLidas(): Observable<void> {
    return this.http.put<void>(`${this.url}/lidas`, {});
  }
}
