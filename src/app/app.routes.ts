import { Routes } from '@angular/router';
import { DashboardComponent } from './pages/dashboard/dashboard';
import { AlunosComponent } from './pages/alunos/alunos';
import { DashboardHome } from './pages/dashboard-home/dashboard-home';

export const routes: Routes = [
  {
    path: 'login',
    loadComponent: () => import('./pages/login/login').then(m => m.LoginComponent)
  },
{
  path: 'dashboard',
  component: DashboardComponent,
  children: [
    { path: '', component: DashboardHome },
    { path: 'alunos', component: AlunosComponent },
    { path: 'treinos', loadComponent: () => import('./pages/treinos/treinos').then(m => m.TreinosComponent) }
  ]
},
  { path: '', redirectTo: 'login', pathMatch: 'full' },
  { path: '**', redirectTo: 'login' }
];