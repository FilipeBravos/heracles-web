import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';

import { podeAcessar, rotaInicial } from '../acesso';
import { AuthService } from '../services/auth.service';

/**
 * Barra o perfil que não alcança a rota.
 *
 * O authGuard só pergunta "está autenticado?". Sem este, um aluno
 * autenticado abria todas as telas administrativas e recebia uma faixa
 * de erro em cada uma — a API recusava, mas a interface oferecia.
 *
 * Roda depois do authGuard, então aqui já existe usuário.
 */
export const perfilGuard: CanActivateFn = (_rota, estado) => {
  const auth = inject(AuthService);
  const router = inject(Router);

  const perfil = auth.usuario()?.tipoPerfil;
  // Compara sem query string: o acesso é da tela, não dos parâmetros.
  const caminho = estado.url.split('?')[0];

  if (podeAcessar(caminho, perfil)) {
    return true;
  }

  // Manda para a primeira área que o perfil alcança, em vez de devolver
  // um 403 de interface: ele não pediu o que não pode, clicou num link
  // que não deveria existir para ele.
  const inicial = rotaInicial(perfil);
  if (inicial && inicial !== caminho) {
    return router.createUrlTree([inicial]);
  }

  // Perfil sem área nenhuma (hoje, ALUNO). Navegar para qualquer rota o
  // traria de volta aqui — vira laço. Encerra a sessão e explica no login.
  auth.encerrarSessao();
  return router.createUrlTree(['/login'], { queryParams: { motivo: 'sem-area' } });
};
