import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class UsuarioService {
  private http = inject(HttpClient);
  private apiUrl = 'http://localhost:8080/api/usuarios';

  // Busca todos os funcionários da rede
  listarTodos(): Observable<any[]> {
    return this.http.get<any[]>(this.apiUrl);
  }

  // Cria um novo funcionário (Admin, Professor, Secretaria...)
  cadastrar(usuario: any): Observable<any> {
    return this.http.post(this.apiUrl, usuario);
  }

  // Desativa o acesso de um funcionário
  inativar(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`);
  }
}