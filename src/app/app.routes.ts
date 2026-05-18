import { Routes } from '@angular/router';
import { DashboardComponent } from './pages/dashboard/dashboard';
import { AlunosComponent } from './pages/alunos/alunos';
import { TreinosComponent } from './pages/treinos/treinos';
import { AgendaComponent } from './pages/agenda/agenda';

import { authGuard } from './core/guards/auth.guard';
import { roleGuard } from './core/guards/role-guard';
import { Financeiro } from './pages/financeiro/financeiro';

export const routes: Routes = [
  // 1. Área Pública
  {
    path: 'login',
    loadComponent: () => import('./pages/login/login').then(m => m.LoginComponent)
  },

  // 2. Área Protegida (Dashboard, Alunos, Treinos, Agenda)
  {
    path: 'dashboard',
    component: DashboardComponent,
    canActivate: [authGuard]
  },
  {
    path: 'alunos',
    component: AlunosComponent,
    canActivate: [authGuard, roleGuard],
    data: { roles: ['PROFESSOR', 'ADMIN'] }
  },
  {
    path: 'treinos',
    component: TreinosComponent,
    canActivate: [authGuard, roleGuard],
    data: { roles: ['PROFESSOR', 'ADMIN'] }
  },
  {
    path: 'agenda',
    component: AgendaComponent,
    canActivate: [authGuard, roleGuard],
    data: { roles: ['ALUNO', 'PROFESSOR', 'ADMIN'] } 
  },

  {
    path: 'meu-treino',
    loadComponent: () => import('./pages/meu-treino/meu-treino').then(m => m.MeuTreinoComponent),
    canActivate: [authGuard, roleGuard],
    data: { roles: ['ALUNO', 'PROFESSOR', 'ADMIN'] } 
  },

    {
    path: 'financeiro',
    component: Financeiro,
    canActivate: [authGuard, roleGuard],
    data: { roles: ['PROFESSOR', 'ADMIN'] } 
  },

];