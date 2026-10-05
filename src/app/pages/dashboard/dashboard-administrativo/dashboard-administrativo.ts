import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { HttpErrorResponse } from '@angular/common/http';
import { DashboardService, DadosDashboardAdmin } from '../../../core/services/dashboard.service';
import { BaseChartDirective, provideCharts, withDefaultRegisterables } from 'ng2-charts';
import { ChartConfiguration, ChartOptions } from 'chart.js';

@Component({
  selector: 'app-dashboard-administrativo',
  standalone: true,
  imports: [CommonModule, MatIconModule, BaseChartDirective],
  providers: [provideCharts(withDefaultRegisterables())],
  templateUrl: './dashboard-administrativo.html'
})
export class DashboardAdministrativoComponent implements OnInit {
  private dashboardService = inject(DashboardService);
  
  public dados = signal<DadosDashboardAdmin | null>(null);

  // Configurações dos Gráficos (iniciam vazias e são preenchidas ao receber os dados)
  public lineChartData!: ChartConfiguration<'line'>['data'];
  public lineChartOptions: ChartOptions<'line'> = { responsive: true, maintainAspectRatio: false };

  public doughnutChartData!: ChartConfiguration<'doughnut'>['data'];
  public doughnutChartOptions: ChartOptions<'doughnut'> = { responsive: true, maintainAspectRatio: false };

  ngOnInit() {
    this.dashboardService.getDadosAdmin().subscribe({
      next: (res) => {
        this.dados.set(res);
        this.montarGraficos(res);
      },
      error: (err: HttpErrorResponse) => console.error('Erro ao carregar métricas administrativas', err)
    });
  }

  private montarGraficos(dados: DadosDashboardAdmin) {
    // Monta o Gráfico de Linha (Evolução de Matrículas)
    this.lineChartData = {
      labels: dados.graficoMatriculas.meses,
      datasets: [
        {
          data: dados.graficoMatriculas.quantidades,
          label: 'Novos Alunos',
          fill: true,
          tension: 0.4,
          borderColor: '#3b82f6', // Azul
          backgroundColor: 'rgba(59, 130, 246, 0.2)'
        }
      ]
    };

    // Monta o Gráfico de Rosca (Divisão por Modalidade)
    this.doughnutChartData = {
      labels: dados.graficoModalidades.labels,
      datasets: [
        {
          data: dados.graficoModalidades.quantidades,
          backgroundColor: ['#10b981', '#f59e0b', '#8b5cf6'] // Verde, Amarelo, Roxo
        }
      ]
    };
  }
}