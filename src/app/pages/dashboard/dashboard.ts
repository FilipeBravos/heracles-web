import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatIconModule
  ],
  templateUrl: './dashboard.html'
})
export class DashboardComponent {
  // Os dados puros do seu dashboard
  estatisticas = [
    { titulo: 'Alunos Ativos', valor: '128', icon: 'groups', cor: 'text-blue-600' },
    { titulo: 'Treinos Hoje', valor: '42', icon: 'fitness_center', cor: 'text-green-600' },
    { titulo: 'Novas Matrículas', valor: '12', icon: 'person_add', cor: 'text-purple-600' },
    { titulo: 'Pendências', valor: '5', icon: 'warning', cor: 'text-red-600' }
  ];
}