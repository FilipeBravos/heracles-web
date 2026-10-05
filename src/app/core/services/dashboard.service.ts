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

export interface AlunoDashboardResumo {
  id: number;
  nome: string;
}

export interface DadosDashboardProfessor {
  alunosPersonal: AlunoDashboardResumo[];
  totalAulasMinistradas: number;
  proximasAulas: AulaResumo[];
  historicoAulas: AulaResumo[];
}

export interface AulaResumo {
  id: number;
  titulo: string;
  dataHora: string;
  totalAlunos: number;
}

export interface DadosDashboardAdmin {
  totalAlunos: number;
  crescimentoAlunos: string;
  unidadesAtivas: number;
  avaliacoesPendentes: number;
  faturamentoPrevisto: number;
  // Dados para os gráficos
  graficoMatriculas: {
    meses: string[];
    quantidades: number[];
  };
  graficoModalidades: {
    labels: string[];
    quantidades: number[];
  };
}

@Injectable({
  providedIn: 'root'
})
export class DashboardService {
  private http = inject(HttpClient);
  private apiUrl = 'http://localhost:8080/api/dashboard';

  getDadosAluno(): Observable<DadosDashboardAluno> {
    return this.http.get<DadosDashboardAluno>(`${this.apiUrl}/aluno`);
  }

  getDadosProfessor(): Observable<DadosDashboardProfessor> {
    return this.http.get<DadosDashboardProfessor>(`${this.apiUrl}/professor`);
  }

  getDadosAdmin() {
  return this.http.get<DadosDashboardAdmin>(`${this.apiUrl}/admin`);
  }
}

