import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';

export interface Aula {
  id: number;
  titulo: string;
  dataHora: string;
  limiteVagas: number;
  vagasOcupadas: number;
  reservadaPeloAluno: boolean;
  professor?: { nome: string };
  descricao?: string;
}

@Injectable({ providedIn: 'root' })
export class AulaService {
  private http = inject(HttpClient);
  private apiUrl = 'http://localhost:8080/api/aulas';

  listarDisponiveis(): Observable<Aula[]> {
    return this.http.get<Aula[]>(`${this.apiUrl}/disponiveis`);
  }

  reservar(aulaId: number): Observable<string> {
    return this.http.post(
      `${this.apiUrl}/${aulaId}/reservar`,
      {},
      { responseType: 'text' },
    );
  }

  criar(aula: Partial<Aula>): Observable<Aula> {
    return this.http.post<Aula>(this.apiUrl, aula);
  }

  listarAlunosInscritos(aulaId: number): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/${aulaId}/alunos`);
  }
}
