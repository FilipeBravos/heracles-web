import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

import { environment } from '../../../environments/environment';
import {
  Acesso,
  Assinatura,
  CancelarForm,
  Checkin,
  Cobranca,
  FilaDeVencimentos,
  HistoricoMensal,
  Lembrete,
  LinhaAlunoInativo,
  LinhaInadimplencia,
  LinhaIndicacao,
  LinhaMotivoCancelamento,
  MatricularForm,
  Pagina,
  PainelFinanceiro,
  PainelOcupacao,
  Retencao,
  ResumoAlunosInativos,
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

  /** Cancelar não apaga: a assinatura vira CANCELADA com data e motivo. */
  cancelar(id: number, motivo: CancelarForm): Observable<Assinatura> {
    return this.http.delete<Assinatura>(`${this.url}/${id}`, { body: motivo });
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

  /** Extrato de lembretes (simulados) da assinatura, mais recente primeiro. */
  historicoLembretes(assinaturaId: number): Observable<Lembrete[]> {
    return this.http.get<Lembrete[]>(`${this.url}/${assinaturaId}/lembretes`);
  }

  /** Ranking do programa de indicação: quantas matrículas cada aluno trouxe. */
  indicacoes(): Observable<LinhaIndicacao[]> {
    return this.http.get<LinhaIndicacao[]>(`${this.url}/indicacoes`);
  }

  /** Quantos cancelamentos por motivo, do mais comum para o menos comum. */
  motivosCancelamento(): Observable<LinhaMotivoCancelamento[]> {
    return this.http.get<LinhaMotivoCancelamento[]>(`${this.url}/motivos-cancelamento`);
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

  /** Cabeçalho do alerta de inatividade: quantos alunos com matrícula ativa pararam de aparecer. */
  resumoAlunosInativos(diasSemCheckin = 14): Observable<ResumoAlunosInativos> {
    const params = new HttpParams().set('diasSemCheckin', diasSemCheckin);
    return this.http.get<ResumoAlunosInativos>(`${this.url}/inatividade/resumo`, { params });
  }

  /** O alerta de inatividade: matrícula ativa, mas o aluno parou de fazer check-in. */
  alunosInativos(pagina = 0, tamanho = 20, diasSemCheckin = 14): Observable<Pagina<LinhaAlunoInativo>> {
    const params = new HttpParams()
      .set('page', pagina)
      .set('size', tamanho)
      .set('diasSemCheckin', diasSemCheckin);
    return this.http.get<Pagina<LinhaAlunoInativo>>(`${this.url}/inatividade`, { params });
  }

  /**
   * Painel de retenção: tendência de churn mensal, e o detalhamento por
   * plano e por unidade do último mês fechado.
   */
  retencao(meses = 12): Observable<Retencao> {
    const params = new HttpParams().set('meses', meses);
    return this.http.get<Retencao>(`${this.url}/retencao`, { params });
  }

  /** Painel financeiro: MRR, ticket médio, inadimplência em R$ e a projeção de caixa do mês. */
  financeiro(): Observable<PainelFinanceiro> {
    return this.http.get<PainelFinanceiro>(`${this.url}/financeiro`);
  }

  /** Ocupação por hora do dia, por unidade, nos últimos `dias` dias. */
  ocupacao(dias = 30): Observable<PainelOcupacao> {
    const params = new HttpParams().set('dias', dias);
    return this.http.get<PainelOcupacao>(`${this.url}/ocupacao`, { params });
  }
}
