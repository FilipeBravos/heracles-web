import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';

export const roleGuard: CanActivateFn = (route, state) => {
  const router = inject(Router);
  
  // Aqui você pega o perfil do usuário logado (geralmente salvo no localStorage no momento do login)
  const perfilUsuario = localStorage.getItem('tipoPerfil'); 

  // Pega os perfis que têm permissão para acessar esta rota (vamos configurar isso no passo 2)
  const perfisPermitidos = route.data['roles'] as Array<string>;

  // Se o usuário tem o perfil que está na lista de permitidos, deixa passar!
  if (perfilUsuario && perfisPermitidos.includes(perfilUsuario)) {
    return true;
  }

  // Se for ALUNO tentando acessar tela de PROFESSOR, manda ele para a tela inicial dele
  router.navigate(['/meu-treino']); 
  return false;
};