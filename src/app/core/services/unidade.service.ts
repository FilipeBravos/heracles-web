import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class UnidadeService {
  private http = inject(HttpClient);
  private apiUrl = 'http://localhost:8080/api/unidades';

  listarTodas(): Observable<any[]> {
    return this.http.get<any[]>(this.apiUrl);
  }

  cadastrar(unidade: any): Observable<any> {
    return this.http.post(this.apiUrl, unidade);
  }
}