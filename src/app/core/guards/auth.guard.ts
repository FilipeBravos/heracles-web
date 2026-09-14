import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';

import { AuthService } from '../services/auth.service';

/**
 * Protege a area logada.
 *
 * Sem isso, /dashboard renderizava para qualquer um que digitasse a URL —
 * o botao "Entrar" simplesmente navegava, sem consultar nada.
 */
export const authGuard: CanActivateFn = (_rota, estado) => {
  const auth = inject(AuthService);
  const router = inject(Router);

  if (auth.autenticado()) {
    return true;
  }

  // Guarda o destino para voltar a ele depois do login.
  return router.createUrlTree(['/login'], { queryParams: { redirecionar: estado.url } });
};

/** Impede que um usuario ja autenticado volte para a tela de login. */
export const visitanteGuard: CanActivateFn = () => {
  const auth = inject(AuthService);
  const router = inject(Router);

  return auth.autenticado() ? router.createUrlTree(['/dashboard']) : true;
};
