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
  AvaliarSessaoPersonalForm,
  HorarioProfessor,
  HorarioProfessorForm,
  LinhaAvaliacaoProfessor,
  LinhaPresenca,
  Pagina,
  PainelPresenca,
  ResultadoInscricao,
} from '../models';

/**
 * Agenda de aulas em grupo, personal e horário de professor — o lado
 * operacional (balcão/professor). O self-service do aluno vive em
 * MinhasAulasService, sob /eu, que a API já isola por token.
 *
 * Uma exceção: confirmar que a própria sessão de personal aconteceu
 * também é sob /eu (só o professor que esteve lá pode atestar), mas o
 * professor faz isso a partir desta tela operacional, não da área do
 * aluno — daí o método morar aqui.
 */
@Injectable({ providedIn: 'root' })
export class AgendaService {
  private readonly http = inject(HttpClient);
  private readonly urlProfessores = `${environment.apiUrl}/professores`;
  private readonly urlAulas = `${environment.apiUrl}/aulas`;
  private readonly urlPersonal = `${environment.apiUrl}/sessoes-personal`;
  private readonly urlEu = `${environment.apiUrl}/eu`;

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

  /**
   * A secretaria marca a vaga em nome do aluno — quem liga ou passa no
   * balcão sem usar o app. A resposta diz se entrou direto ou foi para a
   * fila de espera, já que a turma cheia não recusa mais.
   */
  marcarVaga(aulaId: number, alunoId: number): Observable<ResultadoInscricao> {
    return this.http.post<ResultadoInscricao>(`${this.urlAulas}/${aulaId}/inscricoes`, { alunoId });
  }

  desmarcarVaga(aulaId: number, alunoId: number): Observable<void> {
    return this.http.delete<void>(`${this.urlAulas}/${aulaId}/inscricoes/${alunoId}`);
  }

  /**
   * O roster da aula para o professor confirmar presença — mesma exceção
   * de marcarSessaoPersonalRealizada: é sob /eu (só o professor que deu a
   * aula enxerga), mas ele confirma a partir desta tela operacional.
   */
  inscricoesDaAula(aulaId: number): Observable<LinhaPresenca[]> {
    return this.http.get<LinhaPresenca[]>(`${this.urlEu}/aulas/${aulaId}/inscricoes`);
  }

  /** Confirma presença ou falta de um aluno — uma vez só, depois que a aula aconteceu. */
  confirmarPresenca(aulaId: number, alunoId: number, presente: boolean): Observable<void> {
    return this.http.put<void>(`${this.urlEu}/aulas/${aulaId}/inscricoes/${alunoId}/presenca`, { presente });
  }

  /** Taxa de comparecimento geral e o ranking de quem mais falta em aula em grupo. */
  relatorioPresenca(dias = 90): Observable<PainelPresenca> {
    const params = new HttpParams().set('dias', dias);
    return this.http.get<PainelPresenca>(`${this.urlAulas}/relatorio`, { params });
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

  /** O professor confirma que a própria sessão aconteceu — só ele estava lá para atestar. */
  marcarSessaoPersonalRealizada(id: number): Observable<AgendamentoPersonal> {
    return this.http.put<AgendamentoPersonal>(`${this.urlEu}/sessoes-personal/${id}/realizacao`, {});
  }

  /** Nota média por professor, do melhor pro pior — visibilidade de qualidade de atendimento pra gestão. */
  /** `quantidadeMinima` deixa de fora quem ainda nao tem amostra suficiente pra sustentar a media. */
  avaliacoesPorProfessor(quantidadeMinima = 3): Observable<LinhaAvaliacaoProfessor[]> {
    const params = new HttpParams().set('quantidadeMinima', quantidadeMinima);
    return this.http.get<LinhaAvaliacaoProfessor[]>(`${this.urlPersonal}/avaliacoes`, { params });
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

  /** A resposta diz se entrou direto ou foi para a fila de espera, já que a turma cheia não recusa mais. */
  inscrever(aulaId: number): Observable<ResultadoInscricao> {
    return this.http.post<ResultadoInscricao>(`${this.url}/aulas/${aulaId}/inscricoes`, {});
  }

  cancelarInscricao(aulaId: number): Observable<void> {
    return this.http.delete<void>(`${this.url}/aulas/${aulaId}/inscricoes`);
  }

  sessoesPersonal(pagina = 0, tamanho = 20): Observable<Pagina<AgendamentoPersonal>> {
    const params = new HttpParams().set('page', pagina).set('size', tamanho);
    return this.http.get<Pagina<AgendamentoPersonal>>(`${this.url}/sessoes-personal`, { params });
  }

  /** Avalia a própria sessão já realizada — nota de 1 a 5, comentário opcional. Uma vez só. */
  avaliarSessaoPersonal(id: number, avaliacao: AvaliarSessaoPersonalForm): Observable<AgendamentoPersonal> {
    return this.http.put<AgendamentoPersonal>(`${this.url}/sessoes-personal/${id}/avaliacao`, avaliacao);
  }
}
