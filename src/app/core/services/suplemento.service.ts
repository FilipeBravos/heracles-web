import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Suplemento {
  id?: number;
  nome: string;
  marca: string;
  quantidadeEstoque: number;
  preco: number;
}

export interface RequisicaoVenda {
  quantidade: number;
  nomeComprador: string;
}

@Injectable({
  providedIn: 'root'
})
export class SuplementoService {
  private http = inject(HttpClient);
  private apiUrl = 'http://localhost:8080/api/suplementos';

  listar(): Observable<Suplemento[]> {
    return this.http.get<Suplemento[]>(this.apiUrl);
  }

  salvar(dados: Suplemento): Observable<Suplemento> {
    return this.http.post<Suplemento>(this.apiUrl, dados);
  }

  vender(id: number, dados: RequisicaoVenda): Observable<Suplemento> {
    return this.http.post<Suplemento>(`${this.apiUrl}/${id}/vender`, dados);
  }

  atualizar(id: number, dados: Suplemento): Observable<Suplemento> {
    return this.http.put<Suplemento>(`${this.apiUrl}/${id}`, dados);
  }

  deletar(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}