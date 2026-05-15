import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';

export const authGuard: CanActivateFn = (route, state) => {
  const router = inject(Router);

  const token = localStorage.getItem('heracles_token');

  if (token) {
    return true;
  }

  console.warn('Acesso negado! Redirecionando para o login...');
  router.navigate(['/login']);
  return false;
};