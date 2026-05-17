import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface TreinoSimples {
  id: number;
  nome: string;
}

export interface AlunoSimples {
  id: number;
  nome: string;
  cpf: string;
  email: string;
  status: string;
  treinos?: TreinoSimples[];
}

export interface AlunosPorProfessor {
  meusAlunos: AlunoSimples[];
  alunosSemPersonal: AlunoSimples[];
}

@Injectable({
  providedIn: 'root'
})
export class ProfessorService {
  private http = inject(HttpClient);
  private apiUrl = 'http://localhost:8080/api/professor';

  getAlunosPainel(): Observable<AlunosPorProfessor> {
    return this.http.get<AlunosPorProfessor>(`${this.apiUrl}/alunos`);
  }

  vincularAluno(alunoId: number): Observable<void> {
    return this.http.put<void>(`${this.apiUrl}/alunos/${alunoId}/vincular`, {});
  }
  
  desvincularAluno(alunoId: number): Observable<void> {
    return this.http.put<void>(`${this.apiUrl}/alunos/${alunoId}/desvincular`, {});
  }
}