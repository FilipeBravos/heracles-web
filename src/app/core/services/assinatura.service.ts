import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

import { environment } from '../../../environments/environment';
import { Acesso, Assinatura, MatricularForm, Pagina } from '../models';

@Injectable({ providedIn: 'root' })
export class AssinaturaService {
  private readonly http = inject(HttpClient);
  private readonly url = `${environment.apiUrl}/assinaturas`;

  listar(pagina = 0, tamanho = 20): Observable<Pagina<Assinatura>> {
    const params = new HttpParams().set('page', pagina).set('size', tamanho);
    return this.http.get<Pagina<Assinatura>>(this.url, { params });
  }

  /** Histórico completo do aluno, canceladas inclusive. */
  historicoDoAluno(alunoId: number): Observable<Assinatura[]> {
    return this.http.get<Assinatura[]>(`${this.url}/aluno/${alunoId}`);
  }

  matricular(matricula: MatricularForm): Observable<Assinatura> {
    return this.http.post<Assinatura>(this.url, matricula);
  }

  /** Pagamento entrou: a API empurra o vencimento pelo período do plano. */
  renovar(id: number): Observable<Assinatura> {
    return this.http.put<Assinatura>(`${this.url}/${id}/renovacoes`, {});
  }

  marcarInadimplente(id: number): Observable<Assinatura> {
    return this.http.put<Assinatura>(`${this.url}/${id}/inadimplencia`, {});
  }

  /** Cancelar não apaga: a assinatura vira CANCELADA com data. */
  cancelar(id: number): Observable<Assinatura> {
    return this.http.delete<Assinatura>(`${this.url}/${id}`);
  }

  /** Este aluno pode treinar nesta unidade hoje? */
  conferirAcesso(alunoId: number, unidadeId: number): Observable<Acesso> {
    const params = new HttpParams().set('alunoId', alunoId).set('unidadeId', unidadeId);
    return this.http.get<Acesso>(`${this.url}/acesso`, { params });
  }
}
