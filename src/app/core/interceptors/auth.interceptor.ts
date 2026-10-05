import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, throwError } from 'rxjs';

import { AuthService } from '../services/auth.service';

/**
 * Anexa o bearer token e trata a expiracao da sessao num lugar so,
 * em vez de repetir cabecalhos em cada chamada de componente.
 */
export const authInterceptor: HttpInterceptorFn = (requisicao, proximo) => {
  const auth = inject(AuthService);
  const token = auth.token;

  const requisicaoAutenticada =
    token && !requisicao.url.includes('/auth/login')
      ? requisicao.clone({ setHeaders: { Authorization: `Bearer ${token}` } })
      : requisicao;

  return proximo(requisicaoAutenticada).pipe(
    catchError((erro: HttpErrorResponse) => {
      // 401 em qualquer rota que nao seja o proprio login significa token
      // ausente, expirado ou invalido: derruba a sessao e volta para o login.
      if (erro.status === 401 && !requisicao.url.includes('/auth/login')) {
        auth.encerrarPorTokenInvalido();
      }
      return throwError(() => erro);
    })
  );
};
