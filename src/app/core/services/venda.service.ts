import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

import { environment } from '../../../environments/environment';
import { Pagina, Venda, VendaForm } from '../models';

@Injectable({ providedIn: 'root' })
export class VendaService {
  private readonly http = inject(HttpClient);
  private readonly url = `${environment.apiUrl}/vendas`;

  listar(pagina = 0, tamanho = 20): Observable<Pagina<Venda>> {
    const params = new HttpParams().set('page', pagina).set('size', tamanho);
    return this.http.get<Pagina<Venda>>(this.url, { params });
  }

  registrar(venda: VendaForm): Observable<Venda> {
    return this.http.post<Venda>(this.url, venda);
  }
}
