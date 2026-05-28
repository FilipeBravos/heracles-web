import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Plano {
  id?: number;
  nome: string;
  duracaoMeses: number;
  valor: number;
}

export interface Assinatura {
  id?: number;
  usuarioId: number;
  plano: Plano;
  dataInicio: string;
  dataVencimento: string;
  status: string;
}

export interface MatriculaDTO {
  usuarioId: number;
  planoId: number;
  dataInicio: string;
}

@Injectable({
  providedIn: 'root'
})
export class PlanoService {
  private http = inject(HttpClient);
  private apiUrl = 'http://localhost:8080/api';

  //Traz os pacotes da academia
  listarPlanos(): Observable<Plano[]> {
    return this.http.get<Plano[]>(`${this.apiUrl}/planos`);
  }

  //Salva um novo pacote no catálogo
  salvarPlano(plano: Plano): Observable<Plano> {
    return this.http.post<Plano>(`${this.apiUrl}/planos`, plano);
  }

  //Vincula o aluno ao plano e gera a cobrança
  matricularAluno(dados: MatriculaDTO): Observable<Assinatura> {
    return this.http.post<Assinatura>(`${this.apiUrl}/assinaturas/matricular`, dados);
  }

  //Atualiza o plano existente
  atualizarPlano(id: number, plano: Plano): Observable<Plano> {
    return this.http.put<Plano>(`${this.apiUrl}/planos/${id}`, plano);
  }

  //Remove o plano
  deletarPlano(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/planos/${id}`);
  }
}