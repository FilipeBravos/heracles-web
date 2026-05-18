import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Equipamento {
  id?: number;
  marca: string;
  modelo: string;
  quantidade: number;
  dataUltimaManutencao?: string;
  descricaoUltimaManutencao?: string;
  totalManutencoes: number;
  totalGastoManutencao: number;
}

export interface LancamentoManutencao {
  data: string;
  descricao: string;
  valor: number;
}

export interface HistoricoManutencao {
  id: number;
  dataManutencao: string;
  descricao: string;
  valor: number;
}

@Injectable({
  providedIn: 'root'
})
export class EquipamentoService {
  private http = inject(HttpClient);
  private apiUrl = 'http://localhost:8080/api/equipamentos';

  listar(): Observable<Equipamento[]> {
    return this.http.get<Equipamento[]>(this.apiUrl);
  }

  salvar(dados: Equipamento): Observable<Equipamento> {
    return this.http.post<Equipamento>(this.apiUrl, dados);
  }

  registrarManutencao(id: number, dados: LancamentoManutencao): Observable<Equipamento> {
    return this.http.post<Equipamento>(`${this.apiUrl}/${id}/manutencao`, dados);
  }

  obterHistorico(equipamentoId: number): Observable<HistoricoManutencao[]> {
    return this.http.get<HistoricoManutencao[]>(`${this.apiUrl}/${equipamentoId}/historico`);
  }

  atualizar(id: number, dados: Equipamento): Observable<Equipamento> {
    return this.http.put<Equipamento>(`${this.apiUrl}/${id}`, dados);
  }

  atualizarManutencao(manutencaoId: number, dados: LancamentoManutencao): Observable<HistoricoManutencao> {
    return this.http.put<HistoricoManutencao>(`${this.apiUrl}/manutencao/${manutencaoId}`, dados);
  }

  deletar(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}