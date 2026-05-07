import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AlunoService {
  
  // No Angular 16+, injetamos dependências assim (mais limpo que no construtor)
  private http = inject(HttpClient);

  // A URL base da sua API Heracles
  private apiUrl = 'http://localhost:8080/api/usuarios';

  constructor() { }

  // 1. LISTAR (Para alimentar a tabela)
  listarAlunos(): Observable<any[]> {
    return this.http.get<any[]>(this.apiUrl);
  }

  // 2. BUSCAR POR ID (Se precisar ver detalhes de um aluno)
  buscarPorId(id: number): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/${id}`);
  }

  // 3. CADASTRAR (O que você acabou de fazer funcionar)
  cadastrarAluno(dados: any): Observable<any> {
    return this.http.post<any>(this.apiUrl, dados);
  }

  // 4. ATUALIZAR (O que acabamos de arrumar com o ID no corpo)
  atualizarAluno(id: number, dados: any): Observable<any> {
    return this.http.put<any>(`${this.apiUrl}/${id}`, dados);
  }

  // 5. INATIVAR (O Soft Delete)
  inativarAluno(id: number): Observable<any> {
    return this.http.delete<any>(`${this.apiUrl}/${id}`);
  }

  alternarStatusAluno(id: number): Observable<any> {
  // Dispara o PUT passando o corpo vazio {} igual você tinha feito
  return this.http.put<any>(`${this.apiUrl}/${id}/status`, {});
}
}