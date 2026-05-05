import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router'; // <-- Importe o RouterModule
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatListModule } from '@angular/material/list';
import { MatCardModule } from '@angular/material/card';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule, // <-- Adicione aqui para habilitar routerLink e routerLinkActiveOptions
    MatToolbarModule,
    MatSidenavModule,
    MatButtonModule,
    MatIconModule,
    MatListModule,
    MatCardModule
  ],
  templateUrl: './dashboard.html'
})
export class DashboardComponent {
 estatisticas = [
    { titulo: 'Alunos Ativos', valor: '128', icon: 'groups', cor: 'text-blue-600' },
    { titulo: 'Treinos Hoje', valor: '42', icon: 'fitness_center', cor: 'text-green-600' },
    { titulo: 'Novas Matrículas', valor: '12', icon: 'person_add', cor: 'text-purple-600' },
    { titulo: 'Pendências', valor: '5', icon: 'warning', cor: 'text-red-600' }
  ];
}