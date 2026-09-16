import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import { environment } from '../../../environments/environment';
import { Unidade, UnidadeForm } from '../models';

@Injectable({ providedIn: 'root' })
export class UnidadeService {
  private readonly http = inject(HttpClient);
  private readonly url = `${environment.apiUrl}/unidades`;

  /** A API devolve lista simples aqui: são poucas unidades por rede. */
  listar(): Observable<Unidade[]> {
    return this.http.get<Unidade[]>(this.url);
  }

  criar(unidade: UnidadeForm): Observable<Unidade> {
    return this.http.post<Unidade>(this.url, unidade);
  }

  atualizar(id: number, unidade: UnidadeForm): Observable<Unidade> {
    return this.http.put<Unidade>(`${this.url}/${id}`, unidade);
  }
}
