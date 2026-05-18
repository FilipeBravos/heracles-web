import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface LancamentoFinanceiro {
  id?: number;
  descricao: string;
  valor: number;
  tipo: 'RECEITA' | 'DESPESA';
  categoria: string;
  status: 'PENDENTE' | 'PAGO';
  dataVencimento: string;
  dataPagamento?: string;
  parcelaAtual?: number;
  totalParcelas?: number;
  grupoRecorrencia?: string;
}

export interface ResumoFinanceiro {
  totalReceitas: number;
  totalDespesas: number;
  saldoAtual: number;
}

@Injectable({
  providedIn: 'root',
})
export class FinanceiroService {
  private http = inject(HttpClient);
  private apiUrl = 'http://localhost:8080/api/financeiro';

  listarTransacoes(): Observable<LancamentoFinanceiro[]> {
    return this.http.get<LancamentoFinanceiro[]>(this.apiUrl);
  }

  getResumo(): Observable<ResumoFinanceiro> {
    return this.http.get<ResumoFinanceiro>(`${this.apiUrl}/resumo`);
  }

  salvarLancamento(
    dados: LancamentoFinanceiro,
    qtdParcelas: number = 1,
  ): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}?parcelas=${qtdParcelas}`, dados);
  }

  marcarComoPago(id: number): Observable<LancamentoFinanceiro> {
    return this.http.put<LancamentoFinanceiro>(`${this.apiUrl}/${id}/pagar`, {});
  }

  atualizarLancamento(id: number, dados: LancamentoFinanceiro): Observable<LancamentoFinanceiro> {
    return this.http.put<LancamentoFinanceiro>(`${this.apiUrl}/${id}`, dados);
  }
}
