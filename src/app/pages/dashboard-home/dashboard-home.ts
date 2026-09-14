import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

import { ResumoDashboard } from '../../core/models';
import { DashboardService } from '../../core/services/dashboard.service';
import { mensagemDeErro } from '../../core/services/erro-api';

interface CartaoEstatistica {
  titulo: string;
  valor: number | string;
  icon: string;
  /** Destaque visual só no indicador que pede atenção. */
  tom: 'neutro' | 'acento' | 'perigo';
  nota: string;
}

@Component({
  selector: 'app-dashboard-home',
  standalone: true,
  imports: [MatCardModule, MatIconModule, MatProgressSpinnerModule],
  templateUrl: './dashboard-home.html',
})
export class DashboardHomeComponent implements OnInit {
  private readonly dashboardService = inject(DashboardService);

  private readonly moeda = new Intl.NumberFormat('pt-BR', {
    style: 'currency', currency: 'BRL', maximumFractionDigits: 0,
  });

  readonly carregando = signal(true);
  readonly erro = signal<string | null>(null);
  readonly resumo = signal<ResumoDashboard | null>(null);

  // Os numeros vem da API. Antes eram literais ("128", "42", "12", "5") que
  // apareciam iguais com tres ou tres mil alunos na base.
  readonly cartoes = computed<CartaoEstatistica[]>(() => {
    const dados = this.resumo();
    if (!dados) return [];

    // Os quatro indicadores nao tem o mesmo peso: matricula nova e o
    // numero que o gestor persegue, e aluno inativo e o que exige acao.
    // Os outros dois sao contexto e ficam neutros de proposito — quando
    // tudo e destaque, nada e.
    return [
      {
        titulo: 'Alunos ativos', valor: dados.alunosAtivos, icon: 'groups',
        tom: 'neutro', nota: 'com acesso liberado hoje',
      },
      {
        titulo: 'Fichas atribuídas', valor: dados.fichasAtribuidas,
        icon: 'assignment_turned_in', tom: 'neutro', nota: 'alunos com treino vinculado',
      },
      {
        titulo: 'Matrículas no mês', valor: dados.novasMatriculasNoMes,
        icon: 'trending_up', tom: 'acento', nota: 'cadastros desde o dia 1º',
      },
      {
        titulo: 'Alunos inativos', valor: dados.alunosInativos, icon: 'person_off',
        // Zero inativo e boa noticia: marcar em vermelho chamaria atencao
        // para o que nao precisa de acao.
        tom: dados.alunosInativos > 0 ? 'perigo' : 'neutro',
        nota: dados.alunosInativos > 0 ? 'sem acesso até reativação' : 'nenhum acesso bloqueado',
      },
    ];
  });

  /** Segunda faixa: o que a operação do dia precisa olhar. */
  readonly cartoesOperacao = computed<CartaoEstatistica[]>(() => {
    const dados = this.resumo();
    if (!dados) return [];

    return [
      {
        titulo: 'Faturamento no mês',
        valor: this.moeda.format(dados.faturamentoDoMes ?? 0),
        icon: 'point_of_sale', tom: 'neutro',
        nota: `${dados.vendasNoMes} venda(s) registrada(s)`,
      },
      {
        titulo: 'Estoque baixo', valor: dados.produtosComEstoqueBaixo, icon: 'inventory_2',
        // Só vira alerta quando há o que repor.
        tom: dados.produtosComEstoqueBaixo > 0 ? 'acento' : 'neutro',
        nota: dados.produtosComEstoqueBaixo > 0 ? 'produtos a repor' : 'nenhum produto a repor',
      },
      {
        titulo: 'Em manutenção', valor: dados.equipamentosEmManutencao, icon: 'build',
        tom: dados.equipamentosEmManutencao > 0 ? 'perigo' : 'neutro',
        nota: dados.equipamentosEmManutencao > 0
          ? 'aparelhos fora de operação'
          : 'todos os aparelhos operando',
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
