import { Routes } from '@angular/router';

import { authGuard, visitanteGuard } from './core/guards/auth.guard';
import { perfilGuard } from './core/guards/perfil.guard';

export const routes: Routes = [
  {
    path: 'login',
    canActivate: [visitanteGuard],
    loadComponent: () => import('./pages/login/login').then((m) => m.LoginComponent),
  },
  {
    path: 'dashboard',
    // A area logada inteira exige autenticacao. Antes, /dashboard abria
    // para qualquer visitante que digitasse a URL.
    canActivate: [authGuard],
    loadComponent: () => import('./pages/dashboard/dashboard').then((m) => m.DashboardComponent),
    children: [
      {
        path: '',
        canActivate: [perfilGuard],
        loadComponent: () =>
          import('./pages/dashboard-home/dashboard-home').then((m) => m.DashboardHomeComponent),
      },
      {
        path: 'alunos',
        canActivate: [perfilGuard],
        loadComponent: () => import('./pages/alunos/alunos').then((m) => m.AlunosComponent),
      },
      {
        path: 'treinos',
        canActivate: [perfilGuard],
        loadComponent: () => import('./pages/treinos/treinos').then((m) => m.TreinosComponent),
      },
      {
        path: 'matriculas',
        canActivate: [perfilGuard],
        loadComponent: () =>
          import('./pages/matriculas/matriculas').then((m) => m.MatriculasComponent),
      },
      {
        path: 'loja',
        canActivate: [perfilGuard],
        loadComponent: () => import('./pages/loja/loja').then((m) => m.LojaComponent),
      },
      {
        path: 'equipamentos',
        canActivate: [perfilGuard],
        loadComponent: () =>
          import('./pages/equipamentos/equipamentos').then((m) => m.EquipamentosComponent),
      },
      {
        path: 'agenda',
        canActivate: [perfilGuard],
        loadComponent: () => import('./pages/agenda/agenda').then((m) => m.AgendaComponent),
      },
      {
        path: 'meu-treino',
        canActivate: [perfilGuard],
        loadComponent: () =>
          import('./pages/meu-treino/meu-treino').then((m) => m.MeuTreinoComponent),
      },
      {
        path: 'minha-matricula',
        canActivate: [perfilGuard],
        loadComponent: () =>
          import('./pages/minha-matricula/minha-matricula').then((m) => m.MinhaMatriculaComponent),
      },
      {
        path: 'minhas-aulas',
        canActivate: [perfilGuard],
        loadComponent: () =>
          import('./pages/minhas-aulas/minhas-aulas').then((m) => m.MinhasAulasComponent),
      },
      {
        path: 'unidades',
        canActivate: [perfilGuard],
        loadComponent: () => import('./pages/unidades/unidades').then((m) => m.UnidadesComponent),
      },
      {
        path: 'configuracoes',
        canActivate: [perfilGuard],
        loadComponent: () =>
          import('./pages/configuracoes/configuracoes').then((m) => m.ConfiguracoesComponent),
      },
    ],
  },
  { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
  { path: '**', redirectTo: 'dashboard' },
];
