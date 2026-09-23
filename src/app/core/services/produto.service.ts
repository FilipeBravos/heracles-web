import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

import { environment } from '../../../environments/environment';
import { LinhaProdutoParado, LinhaReposicaoEstoque, Pagina, Produto, ProdutoForm } from '../models';

@Injectable({ providedIn: 'root' })
export class ProdutoService {
  private readonly http = inject(HttpClient);
  private readonly url = `${environment.apiUrl}/produtos`;

  listar(pagina = 0, tamanho = 20, apenasAtivos = false): Observable<Pagina<Produto>> {
    const params = new HttpParams()
      .set('page', pagina)
      .set('size', tamanho)
      .set('apenasAtivos', apenasAtivos);
    return this.http.get<Pagina<Produto>>(this.url, { params });
  }

  criar(produto: ProdutoForm): Observable<Produto> {
    return this.http.post<Produto>(this.url, produto);
  }

  atualizar(id: number, produto: ProdutoForm): Observable<Produto> {
    return this.http.put<Produto>(`${this.url}/${id}`, produto);
  }

  /** Entrada de mercadoria: soma ao saldo, não sobrescreve. */
  registrarEntrada(id: number, quantidade: number): Observable<Produto> {
    return this.http.post<Produto>(`${this.url}/${id}/entradas`, { quantidade });
  }

  alternarAtivo(id: number): Observable<Produto> {
    return this.http.put<Produto>(`${this.url}/${id}/ativo`, {});
  }

  /** Produtos ativos abaixo do próprio estoque mínimo, do maior déficit pro menor. */
  reposicaoEstoque(): Observable<LinhaReposicaoEstoque[]> {
    return this.http.get<LinhaReposicaoEstoque[]>(`${this.url}/reposicao-estoque`);
  }

  /** O oposto da reposição: produtos ativos sem venda há pelo menos `dias`, do mais parado pro menos. */
  produtosParados(dias = 90): Observable<LinhaProdutoParado[]> {
    const params = new HttpParams().set('dias', dias);
    return this.http.get<LinhaProdutoParado[]>(`${this.url}/parados`, { params });
  }
}
