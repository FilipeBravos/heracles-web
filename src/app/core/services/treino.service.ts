import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

import { environment } from '../../../environments/environment';
import { LinhaAdesaoTreino, LinhaAlunoSemFicha, Pagina, ResumoAlunosSemFicha, Treino, TreinoForm } from '../models';

@Injectable({ providedIn: 'root' })
export class TreinoService {
  private readonly http = inject(HttpClient);
  private readonly url = `${environment.apiUrl}/treinos`;
  /** Visão de gestão sobre execuções de exercício, distinta do autoatendimento em /api/eu. */
  private readonly urlExecucoes = `${environment.apiUrl}/execucoes-exercicio`;

  listar(pagina = 0, tamanho = 20): Observable<Pagina<Treino>> {
    const params = new HttpParams().set('page', pagina).set('size', tamanho);
    return this.http.get<Pagina<Treino>>(this.url, { params });
  }

  buscarPorId(id: number): Observable<Treino> {
    return this.http.get<Treino>(`${this.url}/${id}`);
  }

  criar(treino: TreinoForm): Observable<Treino> {
    return this.http.post<Treino>(this.url, treino);
  }

  atualizar(id: number, treino: TreinoForm): Observable<Treino> {
    return this.http.put<Treino>(`${this.url}/${id}`, treino);
  }

  deletar(id: number): Observable<void> {
    return this.http.delete<void>(`${this.url}/${id}`);
  }

  /** Cabeçalho do alerta: quantos alunos com matrícula ativa nunca receberam ficha de treino. */
  resumoAlunosSemFicha(): Observable<ResumoAlunosSemFicha> {
    return this.http.get<ResumoAlunosSemFicha>(`${this.url}/alunos-sem-ficha/resumo`);
  }

  /** O alerta em si: alunos com matrícula ativa que nunca receberam uma ficha de treino. */
  alunosSemFicha(pagina = 0, tamanho = 20): Observable<Pagina<LinhaAlunoSemFicha>> {
    const params = new HttpParams().set('page', pagina).set('size', tamanho);
    return this.http.get<Pagina<LinhaAlunoSemFicha>>(`${this.url}/alunos-sem-ficha`, { params });
  }

  /** Adesão ao treino por aluno, do pior pro melhor. */
  relatorioAdesao(dias = 90, quantidadeMinima = 4): Observable<LinhaAdesaoTreino[]> {
    const params = new HttpParams().set('dias', dias).set('quantidadeMinima', quantidadeMinima);
    return this.http.get<LinhaAdesaoTreino[]>(`${this.urlExecucoes}/relatorio/adesao`, { params });
  }
}
