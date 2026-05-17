import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

// 👇 DEFINE OS TIPOS EXPLICITOS PARA ACABAR COM O 'ANY' E 'UNKNOWN'
export interface HistoricoItem {
  data: string;
  quantidade: number;
}

export interface DadosDashboardAluno {
  exerciciosHoje: number;
  exerciciosSemana: number;
  historicoSeteDias: HistoricoItem[];
}

@Injectable({
  providedIn: 'root'
})
export class DashboardService {
  private http = inject(HttpClient);
  private apiUrl = 'http://localhost:8080/api/dashboard';

  // Tipamos o retorno do Observable aqui 
  getDadosAluno(): Observable<DadosDashboardAluno> {
    return this.http.get<DadosDashboardAluno>(`${this.apiUrl}/aluno`);
  }
}