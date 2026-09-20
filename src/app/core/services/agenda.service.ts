import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

import { environment } from '../../../environments/environment';
import {
  AgendamentoPersonal,
  AgendamentoPersonalForm,
  AulaGrupo,
  AulaGrupoForm,
  AulaGrupoParaAluno,
  HorarioProfessor,
  HorarioProfessorForm,
  Pagina,
} from '../models';

/**
 * Agenda de aulas em grupo, personal e horário de professor — o lado
 * operacional (balcão/professor). O self-service do aluno vive em
 * MinhasAulasService, sob /eu, que a API já isola por token.
 */
@Injectable({ providedIn: 'root' })
export class AgendaService {
  private readonly http = inject(HttpClient);
  private readonly urlProfessores = `${environment.apiUrl}/professores`;
  private readonly urlAulas = `${environment.apiUrl}/aulas`;
  private readonly urlPersonal = `${environment.apiUrl}/sessoes-personal`;

  // ---------------------------------------------------------------
  // Horário do professor
  // ---------------------------------------------------------------

  horariosDoProfessor(professorId: number): Observable<HorarioProfessor[]> {
    return this.http.get<HorarioProfessor[]>(`${this.urlProfessores}/${professorId}/horarios`);
  }

  criarHorario(professorId: number, horario: HorarioProfessorForm): Observable<HorarioProfessor> {
    return this.http.post<HorarioProfessor>(`${this.urlProfessores}/${professorId}/horarios`, horario);
  }

  removerHorario(professorId: number, horarioId: number): Observable<void> {
    return this.http.delete<void>(`${this.urlProfessores}/${professorId}/horarios/${horarioId}`);
  }

  // ---------------------------------------------------------------
  // Aula em grupo
  // ---------------------------------------------------------------

  listarAulas(pagina = 0, tamanho = 20): Observable<Pagina<AulaGrupo>> {
    const params = new HttpParams().set('page', pagina).set('size', tamanho);
    return this.http.get<Pagina<AulaGrupo>>(this.urlAulas, { params });
  }

  criarAula(aula: AulaGrupoForm): Observable<AulaGrupo> {
    return this.http.post<AulaGrupo>(this.urlAulas, aula);
  }

  cancelarAula(id: number): Observable<AulaGrupo> {
    return this.http.put<AulaGrupo>(`${this.urlAulas}/${id}/cancelamento`, {});
  }

  /** A secretaria marca a vaga em nome do aluno — quem liga ou passa no balcão sem usar o app. */
  marcarVaga(aulaId: number, alunoId: number): Observable<void> {
    return this.http.post<void>(`${this.urlAulas}/${aulaId}/inscricoes`, { alunoId });
  }

  desmarcarVaga(aulaId: number, alunoId: number): Observable<void> {
    return this.http.delete<void>(`${this.urlAulas}/${aulaId}/inscricoes/${alunoId}`);
  }

  // ---------------------------------------------------------------
  // Personal
  // ---------------------------------------------------------------

  listarSessoesPersonal(pagina = 0, tamanho = 20): Observable<Pagina<AgendamentoPersonal>> {
    const params = new HttpParams().set('page', pagina).set('size', tamanho);
    return this.http.get<Pagina<AgendamentoPersonal>>(this.urlPersonal, { params });
  }

  criarSessaoPersonal(sessao: AgendamentoPersonalForm): Observable<AgendamentoPersonal> {
    return this.http.post<AgendamentoPersonal>(this.urlPersonal, sessao);
  }

  cancelarSessaoPersonal(id: number): Observable<AgendamentoPersonal> {
    return this.http.put<AgendamentoPersonal>(`${this.urlPersonal}/${id}/cancelamento`, {});
  }
}

/**
 * A agenda do próprio aluno: aulas em grupo (self-service) e sessões de
 * personal (só leitura — quem marca continua sendo o balcão).
 */
@Injectable({ providedIn: 'root' })
export class MinhasAulasService {
  private readonly http = inject(HttpClient);
  private readonly url = `${environment.apiUrl}/eu`;

  aulas(pagina = 0, tamanho = 20): Observable<Pagina<AulaGrupoParaAluno>> {
    const params = new HttpParams().set('page', pagina).set('size', tamanho);
    return this.http.get<Pagina<AulaGrupoParaAluno>>(`${this.url}/aulas`, { params });
  }

  inscrever(aulaId: number): Observable<void> {
    return this.http.post<void>(`${this.url}/aulas/${aulaId}/inscricoes`, {});
  }

  cancelarInscricao(aulaId: number): Observable<void> {
    return this.http.delete<void>(`${this.url}/aulas/${aulaId}/inscricoes`);
  }

  sessoesPersonal(pagina = 0, tamanho = 20): Observable<Pagina<AgendamentoPersonal>> {
    const params = new HttpParams().set('page', pagina).set('size', tamanho);
    return this.http.get<Pagina<AgendamentoPersonal>>(`${this.url}/sessoes-personal`, { params });
  }
}
