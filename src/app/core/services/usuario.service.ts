import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

import { environment } from '../../../environments/environment';
import { EdicaoUsuario, NovoUsuario, Pagina, Usuario } from '../models';

@Injectable({ providedIn: 'root' })
export class UsuarioService {
  private readonly http = inject(HttpClient);
  private readonly url = `${environment.apiUrl}/usuarios`;

  listar(pagina = 0, tamanho = 20): Observable<Pagina<Usuario>> {
    const params = new HttpParams().set('page', pagina).set('size', tamanho);
    return this.http.get<Pagina<Usuario>>(this.url, { params });
  }

  criar(usuario: NovoUsuario): Observable<Usuario> {
    return this.http.post<Usuario>(this.url, usuario);
  }

  atualizar(id: number, usuario: EdicaoUsuario): Observable<Usuario> {
    return this.http.put<Usuario>(`${this.url}/${id}`, usuario);
  }

  alternarStatus(id: number): Observable<Usuario> {
    return this.http.put<Usuario>(`${this.url}/${id}/status`, {});
  }

  sincronizarTreinos(id: number, treinosIds: number[]): Observable<Usuario> {
    return this.http.put<Usuario>(`${this.url}/${id}/treinos`, { treinosIds });
  }
}
