import { Routes } from '@angular/router';

import { authGuard, visitanteGuard } from './core/guards/auth.guard';

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
        loadComponent: () =>
          import('./pages/dashboard-home/dashboard-home').then((m) => m.DashboardHomeComponent),
      },
      {
        path: 'alunos',
        loadComponent: () => import('./pages/alunos/alunos').then((m) => m.AlunosComponent),
      },
      {
        path: 'treinos',
        loadComponent: () => import('./pages/treinos/treinos').then((m) => m.TreinosComponent),
      },
      {
        path: 'matriculas',
        loadComponent: () =>
          import('./pages/matriculas/matriculas').then((m) => m.MatriculasComponent),
      },
      {
        path: 'loja',
        loadComponent: () => import('./pages/loja/loja').then((m) => m.LojaComponent),
      },
      {
        path: 'equipamentos',
        loadComponent: () =>
          import('./pages/equipamentos/equipamentos').then((m) => m.EquipamentosComponent),
      },
      {
        path: 'unidades',
        loadComponent: () => import('./pages/unidades/unidades').then((m) => m.UnidadesComponent),
      },
    ],
  },
  { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
  { path: '**', redirectTo: 'dashboard' },
];
