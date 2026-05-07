import { inject } from '@angular/core';
import { Router, CanActivateFn } from '@angular/router';

export const authGuard: CanActivateFn = (route, state) => {
  const router = inject(Router);
  const token = localStorage.getItem('heracles_token');

  // Se o token existe, permite o acesso
  if (token) {
    return true;
  }

  // Se não existir, manda de volta para o login
  console.warn('Acesso negado! Redirecionando para o login...');
  router.navigate(['/login']);
  return false;
};