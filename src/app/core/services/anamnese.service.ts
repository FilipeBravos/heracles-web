import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AnamneseService {
  private http = inject(HttpClient);
  private apiUrl = 'http://localhost:8080/api/anamneses';

  buscarHistoricoAluno(usuarioId: number): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/aluno/${usuarioId}`);
  }

  salvar(dados: any): Observable<any> {
    return this.http.post<any>(this.apiUrl, dados);
  }

  atualizar(id: number, dados: any): Observable<any> {
    return this.http.put<any>(`${this.apiUrl}/${id}`, dados);
  }

  deletar(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}