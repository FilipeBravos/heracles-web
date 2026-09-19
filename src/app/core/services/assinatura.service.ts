import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

import { environment } from '../../../environments/environment';
import {
  Acesso,
  Assinatura,
  Checkin,
  Cobranca,
  FilaDeVencimentos,
  HistoricoMensal,
  LinhaInadimplencia,
  MatricularForm,
  Pagina,
  ResumoInadimplencia,
} from '../models';

@Injectable({ providedIn: 'root' })
export class AssinaturaService {
  private readonly http = inject(HttpClient);
  private readonly url = `${environment.apiUrl}/assinaturas`;

  listar(pagina = 0, tamanho = 20): Observable<Pagina<Assinatura>> {
    const params = new HttpParams().set('page', pagina).set('size', tamanho);
    return this.http.get<Pagina<Assinatura>>(this.url, { params });
  }

  /** Histórico completo do aluno, canceladas inclusive. */
  historicoDoAluno(alunoId: number): Observable<Assinatura[]> {
    return this.http.get<Assinatura[]>(`${this.url}/aluno/${alunoId}`);
  }

  matricular(matricula: MatricularForm): Observable<Assinatura> {
    return this.http.post<Assinatura>(this.url, matricula);
  }

  /** Pagamento entrou: a API empurra o vencimento pelo período do plano. */
  renovar(id: number): Observable<Assinatura> {
    return this.http.put<Assinatura>(`${this.url}/${id}/renovacoes`, {});
  }

  marcarInadimplente(id: number): Observable<Assinatura> {
    return this.http.put<Assinatura>(`${this.url}/${id}/inadimplencia`, {});
  }

  /** Cancelar não apaga: a assinatura vira CANCELADA com data. */
  cancelar(id: number): Observable<Assinatura> {
    return this.http.delete<Assinatura>(`${this.url}/${id}`);
  }

  /** Série do gráfico de matrículas por mês, do mais antigo ao atual. */
  historicoMensal(meses = 12): Observable<HistoricoMensal> {
    const params = new HttpParams().set('meses', meses);
    return this.http.get<HistoricoMensal>(`${this.url}/historico-mensal`, { params });
  }

  /**
   * Fila de vencimentos do painel: quem vence nos próximos dias — e quem
   * já venceu, que a API inclui de propósito.
   */
  vencimentos(dias = 15, limite = 8): Observable<FilaDeVencimentos> {
    const params = new HttpParams().set('dias', dias).set('limite', limite);
    return this.http.get<FilaDeVencimentos>(`${this.url}/vencimentos`, { params });
  }

  /**
   * Este aluno pode treinar nesta unidade hoje?
   *
   * A própria API grava um check-in a cada chamada — é a mesma pergunta
   * que a recepção faz na porta, então a resposta e o histórico de
   * frequência são o mesmo evento.
   */
  conferirAcesso(alunoId: number, unidadeId: number): Observable<Acesso> {
    const params = new HttpParams().set('alunoId', alunoId).set('unidadeId', unidadeId);
    return this.http.get<Acesso>(`${this.url}/acesso`, { params });
  }

  /** Histórico de frequência do aluno: cada check-in, liberado ou barrado. */
  historicoCheckins(alunoId: number, pagina = 0, tamanho = 20): Observable<Pagina<Checkin>> {
    const params = new HttpParams().set('page', pagina).set('size', tamanho);
    return this.http.get<Pagina<Checkin>>(`${this.url}/checkins/aluno/${alunoId}`, { params });
  }

  /** Extrato de cobranças (simuladas) da assinatura, mais recente primeiro. */
  historicoCobrancas(assinaturaId: number): Observable<Cobranca[]> {
    return this.http.get<Cobranca[]>(`${this.url}/${assinaturaId}/cobrancas`);
  }

  /** Cabeçalho do relatório de inadimplência: quantos em cada etapa da régua. */
  resumoInadimplencia(diasParaVencer = 7): Observable<ResumoInadimplencia> {
    const params = new HttpParams().set('diasParaVencer', diasParaVencer);
    return this.http.get<ResumoInadimplencia>(`${this.url}/inadimplencia/resumo`, { params });
  }

  /** O relatório de inadimplência: quem vence em breve, já venceu ou está inadimplente. */
  inadimplencia(pagina = 0, tamanho = 20, diasParaVencer = 7): Observable<Pagina<LinhaInadimplencia>> {
    const params = new HttpParams()
      .set('page', pagina)
      .set('size', tamanho)
      .set('diasParaVencer', diasParaVencer);
    return this.http.get<Pagina<LinhaInadimplencia>>(`${this.url}/inadimplencia`, { params });
  }
}
