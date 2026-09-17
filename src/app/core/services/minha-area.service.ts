import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import { environment } from '../../../environments/environment';
import { MinhaMatricula, Treino } from '../models';

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

  /**
   * A matrícula vigente de quem está autenticado.
   *
   * Não ter matrícula volta 200 com `temMatricula: false` — é estado, não
   * erro, e a tela precisa dizê-lo em vez de tratar como falha.
   */
  minhaMatricula(): Observable<MinhaMatricula> {
    return this.http.get<MinhaMatricula>(`${this.url}/matricula`);
  }
}
