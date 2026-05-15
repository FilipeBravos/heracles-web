import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Treino {
  id?: number;
  nome: string;
  foco: string;
  nivel: string;
  status?: string;
  exercicios?: any[]; 
}
@Injectable({
  providedIn: 'root'
})

export class TreinoService {
  
  private http = inject(HttpClient);
  private apiUrl = 'http://localhost:8080/api/treinos';

  constructor() { }

  // 1. LISTAR TODOS OS TREINOS
  listar(): Observable<any[]> {
    return this.http.get<any[]>(this.apiUrl);
  }

  // 2. BUSCAR UM TREINO ESPECÍFICO (Para carregar no form de edição ou na tela de detalhes)
  buscarPorId(id: number): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/${id}`);
  }

  // 3. CADASTRAR NOVO TREINO
  cadastrar(dados: any): Observable<any> {
    return this.http.post<any>(this.apiUrl, dados);
  }

  // 4. ATUALIZAR TREINO
  atualizar(id: number, dados: any): Observable<any> {
    return this.http.put<any>(`${this.apiUrl}/${id}`, dados);
  }

  // 5. EXCLUIR / INATIVAR TREINO
  excluir(id: number): Observable<any> {
    return this.http.delete<any>(`${this.apiUrl}/${id}`);
  }
}
