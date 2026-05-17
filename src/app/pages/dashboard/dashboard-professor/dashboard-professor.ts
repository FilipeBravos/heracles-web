import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { HttpErrorResponse } from '@angular/common/http';
import { DashboardService, DadosDashboardProfessor } from '../../../core/services/dashboard.service';

@Component({
  selector: 'app-dashboard-professor',
  standalone: true,
  imports: [CommonModule, MatCardModule, MatIconModule],
  templateUrl: './dashboard-professor.html'
})
export class DashboardProfessorComponent implements OnInit {
  private dashboardService = inject(DashboardService);
  
  // Signal tipado para blindar contra o modo estrito do ngtsc
  public dados = signal<DadosDashboardProfessor | null>(null);

  ngOnInit() {
    this.dashboardService.getDadosProfessor().subscribe({
      next: (res) => this.dados.set(res),
      error: (err: HttpErrorResponse) => console.error('Erro ao carregar métricas do professor', err)
    });
  }
}