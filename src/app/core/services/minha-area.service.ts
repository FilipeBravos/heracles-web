import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import { environment } from '../../../environments/environment';
import { Treino } from '../models';

/**
 * O que o aluno vê de si mesmo.
 *
 * Nenhum método daqui manda id: o sujeito é quem o token identifica. Um
 * `/api/alunos/{id}/treinos` seria a mesma informação com uma porta a
 * mais para fechar.
 */
@Injectable({ providedIn: 'root' })
export class MinhaAreaService {
  private readonly http = inject(HttpClient);
  private readonly url = `${environment.apiUrl}/eu`;

  /** As fichas vinculadas a quem está autenticado. */
  meusTreinos(): Observable<Treino[]> {
    return this.http.get<Treino[]>(`${this.url}/treinos`);
  }
}
