import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import { environment } from '../../../environments/environment';
import {
  AtualizarMeusDadosForm,
  HistoricoTreino,
  MeusDados,
  MinhaMatricula,
  Treino,
  TrocarSenhaForm,
} from '../models';

/**
 * O que qualquer usuário autenticado vê e edita de si mesmo.
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
   * Fichas que já foram de quem está autenticado e não são mais.
   *
   * A atual não vem aqui — já sai em `meusTreinos()`.
   */
  historicoDeTreinos(): Observable<HistoricoTreino[]> {
    return this.http.get<HistoricoTreino[]>(`${this.url}/treinos/historico`);
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

  /** Nome, e-mail e telefone de quem está autenticado. */
  meusDados(): Observable<MeusDados> {
    return this.http.get<MeusDados>(`${this.url}/dados`);
  }

  /** Atualiza nome e telefone. E-mail e CPF não são editáveis por aqui. */
  atualizarMeusDados(form: AtualizarMeusDadosForm): Observable<MeusDados> {
    return this.http.put<MeusDados>(`${this.url}/dados`, form);
  }

  /** Troca a própria senha. A API exige a atual antes de aceitar a nova. */
  trocarSenha(form: TrocarSenhaForm): Observable<void> {
    return this.http.put<void>(`${this.url}/senha`, form);
  }
}
