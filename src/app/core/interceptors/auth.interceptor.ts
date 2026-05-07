import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const router = inject(Router); // Injetamos o router para o redirecionamento
  const token = localStorage.getItem('heracles_token');

  let authReq = req;
  if (token) {
    authReq = req.clone({
      setHeaders: { Authorization: `Bearer ${token}` }
    });
  }

  return next(authReq).pipe(
    catchError((error: HttpErrorResponse) => {
      // Se o erro for 401, o token provavelmente expirou ou é inválido
      if (error.status === 401) {
        console.warn('Sessão expirada ou inválida. Deslogando...');
        localStorage.removeItem('heracles_token');
        router.navigate(['/login']);
      }
      return throwError(() => error);
    })
  );
};