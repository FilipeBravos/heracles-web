import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

import { ResumoDashboard } from '../../core/models';
import { DashboardService } from '../../core/services/dashboard.service';
import { mensagemDeErro } from '../../core/services/erro-api';

interface CartaoEstatistica {
  titulo: string;
  valor: number;
  icon: string;
  corTexto: string;
  corFundo: string;
}

@Component({
  selector: 'app-dashboard-home',
  standalone: true,
  imports: [MatCardModule, MatIconModule, MatProgressSpinnerModule],
  templateUrl: './dashboard-home.html',
})
export class DashboardHomeComponent implements OnInit {
  private readonly dashboardService = inject(DashboardService);

  readonly carregando = signal(true);
  readonly erro = signal<string | null>(null);
  readonly resumo = signal<ResumoDashboard | null>(null);

  // Os numeros vem da API. Antes eram literais ("128", "42", "12", "5") que
  // apareciam iguais com tres ou tres mil alunos na base.
  readonly cartoes = computed<CartaoEstatistica[]>(() => {
    const dados = this.resumo();
    if (!dados) return [];

    return [
      {
        titulo: 'Alunos Ativos', valor: dados.alunosAtivos,
        icon: 'groups', corTexto: 'text-blue-600', corFundo: 'bg-blue-50',
      },
      {
        titulo: 'Fichas Atribuídas', valor: dados.fichasAtribuidas,
        icon: 'assignment_turned_in', corTexto: 'text-green-600', corFundo: 'bg-green-50',
      },
      {
        titulo: 'Novas Matrículas no Mês', valor: dados.novasMatriculasNoMes,
        icon: 'person_add', corTexto: 'text-purple-600', corFundo: 'bg-purple-50',
      },
      {
        titulo: 'Alunos Inativos', valor: dados.alunosInativos,
        icon: 'person_off', corTexto: 'text-red-600', corFundo: 'bg-red-50',
      },
    ];
  });

  ngOnInit(): void {
    this.carregar();
  }

  carregar(): void {
    this.carregando.set(true);
    this.erro.set(null);

    this.dashboardService.resumo().subscribe({
      next: (dados) => {
        this.resumo.set(dados);
        this.carregando.set(false);
      },
      error: (erro) => {
        this.erro.set(mensagemDeErro(erro, 'Não foi possível carregar o resumo.'));
        this.carregando.set(false);
      },
    });
  }
}
