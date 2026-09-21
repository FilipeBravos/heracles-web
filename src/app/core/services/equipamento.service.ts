import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

import { environment } from '../../../environments/environment';
import { ChamadoManutencao, Equipamento, EquipamentoForm, Pagina, PainelManutencao } from '../models';

@Injectable({ providedIn: 'root' })
export class EquipamentoService {
  private readonly http = inject(HttpClient);
  private readonly url = `${environment.apiUrl}/equipamentos`;

  listar(pagina = 0, tamanho = 20): Observable<Pagina<Equipamento>> {
    const params = new HttpParams().set('page', pagina).set('size', tamanho);
    return this.http.get<Pagina<Equipamento>>(this.url, { params });
  }

  criar(equipamento: EquipamentoForm): Observable<Equipamento> {
    return this.http.post<Equipamento>(this.url, equipamento);
  }

  atualizar(id: number, equipamento: EquipamentoForm): Observable<Equipamento> {
    return this.http.put<Equipamento>(`${this.url}/${id}`, equipamento);
  }

  historico(id: number): Observable<ChamadoManutencao[]> {
    return this.http.get<ChamadoManutencao[]>(`${this.url}/${id}/chamados`);
  }

  /** Abrir chamado também tira o equipamento de operação, na API. */
  abrirChamado(id: number, descricaoProblema: string): Observable<ChamadoManutencao> {
    return this.http.post<ChamadoManutencao>(`${this.url}/${id}/chamados`, { descricaoProblema });
  }

  resolverChamado(chamadoId: number, custoReparo: number | null): Observable<ChamadoManutencao> {
    return this.http.put<ChamadoManutencao>(`${this.url}/chamados/${chamadoId}/resolver`, { custoReparo });
  }

  /** Painel de manutenção: custo, tempo médio de resolução, equipamentos mais problemáticos e comparação por unidade. */
  relatorio(dias = 90): Observable<PainelManutencao> {
    const params = new HttpParams().set('dias', dias);
    return this.http.get<PainelManutencao>(`${this.url}/relatorio`, { params });
  }
}
