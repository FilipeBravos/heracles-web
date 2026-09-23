import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { CurrencyPipe, DatePipe } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

import { RouterLink } from '@angular/router';

import {
  Aniversariante,
  FilaDeVencimentos,
  HistoricoMensal,
  LinhaTaxaLeituraNotificacao,
  PainelFinanceiro,
  PainelOcupacao,
  Retencao,
  ResumoDashboard,
  ROTULO_MOTIVO_ACESSO,
  ROTULO_TIPO_NOTIFICACAO,
  Vencimento,
  descreverMes,
  descreverPrazo,
  urgenciaDoPrazo,
} from '../../core/models';
import { GraficoChurnComponent } from './grafico-churn/grafico-churn';
import { GraficoMatriculasComponent } from './grafico-matriculas/grafico-matriculas';
import { GraficoOcupacaoComponent } from './grafico-ocupacao/grafico-ocupacao';
import { AssinaturaService } from '../../core/services/assinatura.service';
import { AuthService } from '../../core/services/auth.service';
import { DashboardService } from '../../core/services/dashboard.service';
import { NotificacaoService } from '../../core/services/notificacao.service';
import { UsuarioService } from '../../core/services/usuario.service';
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
  imports: [
    MatCardModule,
    MatIconModule,
    MatProgressSpinnerModule,
    DatePipe,
    CurrencyPipe,
    RouterLink,
    GraficoMatriculasComponent,
    GraficoChurnComponent,
    GraficoOcupacaoComponent,
  ],
  templateUrl: './dashboard-home.html',
})
export class DashboardHomeComponent implements OnInit {
  private readonly dashboardService = inject(DashboardService);
  private readonly assinaturaService = inject(AssinaturaService);
  private readonly usuarioService = inject(UsuarioService);
  private readonly notificacaoService = inject(NotificacaoService);
  private readonly auth = inject(AuthService);

  /** Janela do painel de vencimentos. */
  private readonly DIAS_DA_FILA = 15;

  /** Quantos meses o gráfico cobre. */
  private readonly MESES_DO_GRAFICO = 12;

  /** Janela do painel de ocupação — recente o bastante para refletir o uso atual, não sazonalidade antiga. */
  private readonly DIAS_DA_OCUPACAO = 30;

  private readonly moeda = new Intl.NumberFormat('pt-BR', {
    style: 'currency', currency: 'BRL', maximumFractionDigits: 0,
  });

  readonly carregando = signal(true);
  readonly erro = signal<string | null>(null);
  readonly resumo = signal<ResumoDashboard | null>(null);

  readonly historico = signal<HistoricoMensal | null>(null);
  readonly carregandoHistorico = signal(true);
  readonly erroHistorico = signal<string | null>(null);

  readonly fila = signal<FilaDeVencimentos | null>(null);
  readonly carregandoFila = signal(true);
  readonly erroFila = signal<string | null>(null);

  readonly retencao = signal<Retencao | null>(null);
  readonly carregandoRetencao = signal(true);
  readonly erroRetencao = signal<string | null>(null);

  readonly financeiro = signal<PainelFinanceiro | null>(null);
  readonly carregandoFinanceiro = signal(true);
  readonly erroFinanceiro = signal<string | null>(null);

  readonly ocupacao = signal<PainelOcupacao | null>(null);
  readonly carregandoOcupacao = signal(true);
  readonly erroOcupacao = signal<string | null>(null);

  /** Janela do painel de leitura de notificações. */
  private readonly DIAS_LEITURA_NOTIFICACAO = 90;

  readonly taxaLeituraNotificacao = signal<LinhaTaxaLeituraNotificacao[]>([]);
  readonly carregandoTaxaLeitura = signal(true);
  readonly erroTaxaLeitura = signal<string | null>(null);
  readonly rotuloTipoNotificacao = ROTULO_TIPO_NOTIFICACAO;
  readonly rotuloMotivoAcesso = ROTULO_MOTIVO_ACESSO;

  /** Visível pra todo perfil — vem de /api/usuarios, sem o dado financeiro que restringe a faixa de matrículas. */
  readonly aniversariantes = signal<Aniversariante[]>([]);
  readonly carregandoAniversariantes = signal(true);
  readonly erroAniversariantes = signal<string | null>(null);

  /**
   * A carteira de matrículas é da recepção e da administração: o professor
   * não cobra ninguém, e a situação de pagamento de um aluno não é dado
   * que ele precise ver. Vale para os dois painéis daqui — a fila de
   * vencimentos e o gráfico —, porque os dois saem de `/api/assinaturas`,
   * que a API recusa para esse perfil. Esconder evita mostrar um erro no
   * lugar de um painel que não é dele.
   *
   * Os cartões agregados seguem visíveis: eles vêm de `/api/dashboard`, e
   * um número não nomeia ninguém.
   */
  readonly podeVerMatriculas = computed(() => {
    const perfil = this.auth.usuario()?.tipoPerfil;
    return perfil === 'ADMIN' || perfil === 'SECRETARIA';
  });

  /** Quantas ficaram de fora da lista mostrada. */
  readonly restantesNaFila = computed(() => {
    const fila = this.fila();
    return fila ? Math.max(0, fila.total - fila.itens.length) : 0;
  });

  readonly prazo = descreverPrazo;
  readonly urgencia = urgenciaDoPrazo;
  readonly mesPorExtenso = descreverMes;

  // Os numeros vem da API. Antes eram literais ("128", "42", "12", "5") que
  // apareciam iguais com tres ou tres mil alunos na base.
  readonly cartoes = computed<CartaoEstatistica[]>(() => {
    const dados = this.resumo();
    if (!dados) return [];

    // Aluno inativo e o unico que exige acao aqui; os outros dois sao
    // contexto e ficam neutros de proposito — quando tudo e destaque,
    // nada e. Matricula saiu desta faixa: com o schema matriculas em
    // uso, ela tem numeros proprios e uma faixa so dela.
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
        titulo: 'Alunos inativos', valor: dados.alunosInativos, icon: 'person_off',
        // Zero inativo e boa noticia: marcar em vermelho chamaria atencao
        // para o que nao precisa de acao.
        tom: dados.alunosInativos > 0 ? 'perigo' : 'neutro',
        nota: dados.alunosInativos > 0 ? 'sem acesso até reativação' : 'nenhum acesso bloqueado',
      },
    ];
  });

  /**
   * Segunda faixa: a carteira de matrículas.
   *
   * Inadimplente e vencida são coisas diferentes e não podem virar um
   * número só: inadimplente é quem a secretaria marcou por falta de
   * pagamento, vencida é quem simplesmente passou da data. As duas
   * barram o acesso, mas a primeira já foi tratada e a segunda não.
   */
  readonly cartoesMatriculas = computed<CartaoEstatistica[]>(() => {
    const dados = this.resumo();
    if (!dados) return [];

    return [
      {
        titulo: 'Matrículas no mês', valor: dados.novasMatriculasNoMes,
        icon: 'trending_up', tom: 'acento', nota: 'iniciadas desde o dia 1º',
      },
      {
        titulo: 'Inadimplentes', valor: dados.matriculasInadimplentes, icon: 'block',
        tom: dados.matriculasInadimplentes > 0 ? 'perigo' : 'neutro',
        nota: dados.matriculasInadimplentes > 0
          ? 'em atraso, com acesso interrompido'
          : 'nenhuma matrícula em atraso',
      },
      {
        titulo: 'Vencidas', valor: dados.matriculasVencidas, icon: 'event_upcoming',
        tom: dados.matriculasVencidas > 0 ? 'acento' : 'neutro',
        nota: dados.matriculasVencidas > 0
          ? 'passaram da data e precisam renovar'
          : 'nenhuma matrícula vencida',
      },
    ];
  });

  /** Terceira faixa: o que a operação do dia precisa olhar. */
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

  /**
   * Quarta faixa: o dinheiro, onde as faixas de cima medem alunos.
   *
   * Mesma restrição de acesso da retenção: dado de faturamento não é do
   * professor, e vem do mesmo `/api/assinaturas` que o perfil dele não
   * pode consultar.
   */
  readonly cartoesFinanceiro = computed<CartaoEstatistica[]>(() => {
    const dados = this.financeiro();
    if (!dados) return [];

    return [
      {
        titulo: 'MRR', valor: this.moeda.format(dados.mrr), icon: 'trending_up',
        tom: 'neutro', nota: `${dados.assinaturasAtivas} assinatura(s) ativa(s)`,
      },
      {
        titulo: 'Ticket médio', valor: this.moeda.format(dados.ticketMedio),
        icon: 'point_of_sale', tom: 'neutro', nota: 'por assinatura ativa',
      },
      {
        titulo: 'Inadimplência em R$', valor: this.moeda.format(dados.inadimplenciaEmReais),
        icon: 'block', tom: dados.inadimplenciaEmReais > 0 ? 'perigo' : 'neutro',
        nota: dados.inadimplenciaEmReais > 0
          ? 'vencida ou marcada inadimplente'
          : 'nada vencido ou inadimplente',
      },
      {
        titulo: 'Projeção do mês', valor: this.moeda.format(dados.projecaoDoMes),
        icon: 'event_upcoming', tom: 'neutro',
        nota: `cobranças com vencimento em ${this.mesPorExtenso(dados.mesReferencia)}`,
      },
    ];
  });

  ngOnInit(): void {
    this.carregar();
    this.carregarAniversariantes();

    if (this.podeVerMatriculas()) {
      this.carregarHistorico();
      this.carregarFila();
      this.carregarRetencao();
      this.carregarFinanceiro();
      this.carregarOcupacao();
      this.carregarTaxaLeituraNotificacao();
    } else {
      this.carregandoHistorico.set(false);
      this.carregandoFila.set(false);
      this.carregandoRetencao.set(false);
      this.carregandoFinanceiro.set(false);
      this.carregandoOcupacao.set(false);
      this.carregandoTaxaLeitura.set(false);
    }
  }

  carregarHistorico(): void {
    this.carregandoHistorico.set(true);
    this.erroHistorico.set(null);

    this.assinaturaService.historicoMensal(this.MESES_DO_GRAFICO).subscribe({
      next: (historico) => {
        this.historico.set(historico);
        this.carregandoHistorico.set(false);
      },
      error: (erro) => {
        this.erroHistorico.set(mensagemDeErro(erro, 'Não foi possível carregar o histórico.'));
        this.carregandoHistorico.set(false);
      },
    });
  }

  carregarFila(): void {
    this.carregandoFila.set(true);
    this.erroFila.set(null);

    this.assinaturaService.vencimentos(this.DIAS_DA_FILA).subscribe({
      next: (fila) => {
        this.fila.set(fila);
        this.carregandoFila.set(false);
      },
      error: (erro) => {
        this.erroFila.set(mensagemDeErro(erro, 'Não foi possível carregar os vencimentos.'));
        this.carregandoFila.set(false);
      },
    });
  }

  carregarRetencao(): void {
    this.carregandoRetencao.set(true);
    this.erroRetencao.set(null);

    this.assinaturaService.retencao(this.MESES_DO_GRAFICO).subscribe({
      next: (retencao) => {
        this.retencao.set(retencao);
        this.carregandoRetencao.set(false);
      },
      error: (erro) => {
        this.erroRetencao.set(mensagemDeErro(erro, 'Não foi possível carregar a retenção.'));
        this.carregandoRetencao.set(false);
      },
    });
  }

  carregarFinanceiro(): void {
    this.carregandoFinanceiro.set(true);
    this.erroFinanceiro.set(null);

    this.assinaturaService.financeiro().subscribe({
      next: (financeiro) => {
        this.financeiro.set(financeiro);
        this.carregandoFinanceiro.set(false);
      },
      error: (erro) => {
        this.erroFinanceiro.set(mensagemDeErro(erro, 'Não foi possível carregar o financeiro.'));
        this.carregandoFinanceiro.set(false);
      },
    });
  }

  carregarOcupacao(): void {
    this.carregandoOcupacao.set(true);
    this.erroOcupacao.set(null);

    this.assinaturaService.ocupacao(this.DIAS_DA_OCUPACAO).subscribe({
      next: (ocupacao) => {
        this.ocupacao.set(ocupacao);
        this.carregandoOcupacao.set(false);
      },
      error: (erro) => {
        this.erroOcupacao.set(mensagemDeErro(erro, 'Não foi possível carregar a ocupação.'));
        this.carregandoOcupacao.set(false);
      },
    });
  }

  carregarTaxaLeituraNotificacao(): void {
    this.carregandoTaxaLeitura.set(true);
    this.erroTaxaLeitura.set(null);

    this.notificacaoService.taxaLeituraPorTipo(this.DIAS_LEITURA_NOTIFICACAO).subscribe({
      next: (linhas) => {
        this.taxaLeituraNotificacao.set(linhas);
        this.carregandoTaxaLeitura.set(false);
      },
      error: (erro) => {
        this.erroTaxaLeitura.set(mensagemDeErro(erro, 'Não foi possível carregar a taxa de leitura.'));
        this.carregandoTaxaLeitura.set(false);
      },
    });
  }

  carregarAniversariantes(): void {
    this.carregandoAniversariantes.set(true);
    this.erroAniversariantes.set(null);

    this.usuarioService.aniversariantes().subscribe({
      next: (linhas) => {
        this.aniversariantes.set(linhas);
        this.carregandoAniversariantes.set(false);
      },
      error: (erro) => {
        this.erroAniversariantes.set(mensagemDeErro(erro, 'Não foi possível carregar os aniversariantes.'));
        this.carregandoAniversariantes.set(false);
      },
    });
  }

  /** Iniciais do aniversariante para o avatar da linha. */
  iniciaisAniversariante(aniversariante: Aniversariante): string {
    const partes = aniversariante.alunoNome.trim().split(/\s+/);
    const primeira = partes[0]?.[0] ?? '';
    const ultima = partes.length > 1 ? partes[partes.length - 1][0] : '';
    return (primeira + ultima).toUpperCase();
  }

  /** Iniciais do aluno para o avatar da linha. */
  iniciais(vencimento: Vencimento): string {
    const partes = vencimento.alunoNome.trim().split(/\s+/);
    const primeira = partes[0]?.[0] ?? '';
    const ultima = partes.length > 1 ? partes[partes.length - 1][0] : '';
    return (primeira + ultima).toUpperCase();
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
