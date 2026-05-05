import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private http = inject(HttpClient);
  private readonly API_URL = 'http://localhost:8080/api';

  login(email: string, senha: string): Observable<any> {
    // Por enquanto, como a API está aberta (permitAll), 
    // vamos apenas simular a busca do usuário.
    return this.http.get(`${this.API_URL}/usuarios`);
  }
}