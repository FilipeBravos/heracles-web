import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { HttpErrorResponse } from '@angular/common/http';
import { DashboardService, DadosDashboardAluno } from '../../core/services/dashboard.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, MatCardModule, MatIconModule],
  templateUrl: './dashboard.html'
})
export class DashboardComponent implements OnInit {
  private dashboardService = inject(DashboardService);
  
  public dados = signal<DadosDashboardAluno | null>(null);

  ngOnInit() {
    this.dashboardService.getDadosAluno().subscribe({
      next: (res) => this.dados.set(res),
      error: (err: HttpErrorResponse) => console.error('Erro ao carregar dashboard', err)
    });
  }
}