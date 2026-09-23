import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { CurrencyPipe, DatePipe } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatPaginatorIntl, MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatTableModule } from '@angular/material/table';
import { MatTabsModule } from '@angular/material/tabs';
import { MatTooltipModule } from '@angular/material/tooltip';

import { ChamadoManutencao, Equipamento, LinhaManutencaoPreventiva, PainelManutencao } from '../../core/models';
import { EquipamentoService } from '../../core/services/equipamento.service';
import { podeExecutar } from '../../core/acesso';
import { AuthService } from '../../core/services/auth.service';
import { mensagemDeErro } from '../../core/services/erro-api';
import { PaginadorIntl } from '../../core/paginador-intl';
import { EquipamentoFormComponent } from './equipamento-form/equipamento-form';
import { ChamadoDialogComponent } from './chamado-dialog/chamado-dialog';

@Component({
  selector: 'app-equipamentos',
  standalone: true,
  imports: [
    MatTableModule,
    MatButtonModule,
    MatIconModule,
    MatPaginatorModule,
    MatProgressSpinnerModule,
    MatTabsModule,
    MatTooltipModule,
    CurrencyPipe,
    DatePipe,
  ],
  templateUrl: './equipamentos.html',
  providers: [{ provide: MatPaginatorIntl, useClass: PaginadorIntl }],
})
export class EquipamentosComponent implements OnInit {
  private readonly equipamentoService = inject(EquipamentoService);
  private readonly auth = inject(AuthService);

  /** A tela é alcançável por mais perfis do que esta ação. */
  readonly podeGerenciar = computed(() =>
    podeExecutar('gerenciar-equipamento', this.auth.usuario()?.tipoPerfil)
  );

  /** A tela é alcançável por mais perfis do que esta ação. */
  readonly podeResolver = computed(() =>
    podeExecutar('resolver-chamado', this.auth.usuario()?.tipoPerfil)
  );
  private readonly dialog = inject(MatDialog);
  private readonly snackBar = inject(MatSnackBar);

  readonly displayedColumns = ['nome', 'unidade', 'status', 'acoes'];

  readonly equipamentos = signal<Equipamento[]>([]);
  readonly carregando = signal(true);
  readonly erro = signal<string | null>(null);
  readonly total = signal(0);
  readonly pagina = signal(0);
  readonly tamanhoPagina = signal(20);

  /** Histórico aberto por equipamento, carregado sob demanda. */
  readonly expandido = signal<number | null>(null);

  /** O equipamento cujo histórico está aberto — não o primeiro da lista. */
  readonly equipamentoExpandido = computed(
    () => this.equipamentos().find((e) => e.id === this.expandido()) ?? null
  );
  readonly historico = signal<ChamadoManutencao[]>([]);
  readonly carregandoHistorico = signal(false);

  readonly colunasMaisProblematicos = ['posicao', 'equipamento', 'unidade', 'chamados', 'custo'];
  readonly colunasPorUnidade = ['unidade', 'chamados', 'custo'];
  readonly relatorio = signal<PainelManutencao | null>(null);
  readonly carregandoRelatorio = signal(false);
  readonly erroRelatorio = signal<string | null>(null);
  private relatorioCarregado = false;

  readonly colunasManutencaoPreventiva = ['equipamento', 'unidade', 'ultimaManutencao', 'proximaManutencao', 'atraso'];
  readonly manutencaoPreventiva = signal<LinhaManutencaoPreventiva[]>([]);
  readonly carregandoManutencaoPreventiva = signal(false);
  readonly erroManutencaoPreventiva = signal<string | null>(null);
  private manutencaoPreventivaCarregada = false;

  ngOnInit(): void {
    this.listar();
  }

  /** Só busca cada aba quando ela é aberta pela primeira vez. */
  aoTrocarAba(indice: number): void {
    if (indice === 1 && !this.relatorioCarregado) {
      this.carregarRelatorio();
    }
    if (indice === 2 && !this.manutencaoPreventivaCarregada) {
      this.carregarManutencaoPreventiva();
    }
  }

  carregarRelatorio(): void {
    this.carregandoRelatorio.set(true);
    this.erroRelatorio.set(null);

    this.equipamentoService.relatorio(90).subscribe({
      next: (relatorio) => {
        this.relatorio.set(relatorio);
        this.carregandoRelatorio.set(false);
        this.relatorioCarregado = true;
      },
      error: (erro) => {
        this.erroRelatorio.set(mensagemDeErro(erro, 'Não foi possível carregar o relatório de manutenção.'));
        this.carregandoRelatorio.set(false);
      },
    });
  }

  carregarManutencaoPreventiva(): void {
    this.carregandoManutencaoPreventiva.set(true);
    this.erroManutencaoPreventiva.set(null);

    this.equipamentoService.relatorioManutencaoPreventiva().subscribe({
      next: (linhas) => {
        this.manutencaoPreventiva.set(linhas);
        this.carregandoManutencaoPreventiva.set(false);
        this.manutencaoPreventivaCarregada = true;
      },
      error: (erro) => {
        this.erroManutencaoPreventiva.set(
          mensagemDeErro(erro, 'Não foi possível carregar a manutenção preventiva.'));
        this.carregandoManutencaoPreventiva.set(false);
      },
    });
  }

  listar(): void {
    this.carregando.set(true);
    this.erro.set(null);

    this.equipamentoService.listar(this.pagina(), this.tamanhoPagina()).subscribe({
      next: (pagina) => {
        this.equipamentos.set(pagina.content);
        this.total.set(pagina.totalElements);
        this.carregando.set(false);
      },
      error: (erro) => {
        this.erro.set(mensagemDeErro(erro, 'Não foi possível carregar os equipamentos.'));
        this.carregando.set(false);
      },
    });
  }

  mudarPagina(evento: PageEvent): void {
    this.pagina.set(evento.pageIndex);
    this.tamanhoPagina.set(evento.pageSize);
    this.expandido.set(null);
    this.listar();
  }

  abrirFormulario(equipamento: Equipamento | null): void {
    this.dialog
      .open(EquipamentoFormComponent, { width: '520px', data: { equipamento } })
      .afterClosed()
      .subscribe((salvou) => {
        if (salvou) {
          this.snackBar.open(equipamento ? 'Equipamento atualizado.' : 'Equipamento cadastrado.', 'Fechar', { duration: 4000 });
          this.listar();
        }
      });
  }

  abrirChamado(equipamento: Equipamento, evento: Event): void {
    evento.stopPropagation();
    this.dialog
      .open(ChamadoDialogComponent, { width: '560px', data: { equipamento, chamado: null } })
      .afterClosed()
      .subscribe((salvou) => {
        if (salvou) {
          this.snackBar.open('Chamado aberto. O equipamento saiu de operação.', 'Fechar', { duration: 5000 });
          this.recarregarTudo(equipamento.id);
        }
      });
  }

  resolverChamado(equipamento: Equipamento, chamado: ChamadoManutencao): void {
    this.dialog
      .open(ChamadoDialogComponent, { width: '560px', data: { equipamento, chamado } })
      .afterClosed()
      .subscribe((salvou) => {
        if (salvou) {
          this.snackBar.open('Chamado resolvido. O equipamento voltou a operar.', 'Fechar', { duration: 5000 });
          this.recarregarTudo(equipamento.id);
        }
      });
  }

  alternarHistorico(equipamento: Equipamento): void {
    if (this.expandido() === equipamento.id) {
      this.expandido.set(null);
      return;
    }
    this.expandido.set(equipamento.id);
    this.carregarHistorico(equipamento.id);
  }

  private carregarHistorico(id: number): void {
    this.carregandoHistorico.set(true);
    this.historico.set([]);

    this.equipamentoService.historico(id).subscribe({
      next: (chamados) => {
        this.historico.set(chamados);
        this.carregandoHistorico.set(false);
      },
      error: (erro) => {
        this.carregandoHistorico.set(false);
        this.snackBar.open(mensagemDeErro(erro), 'Fechar', { duration: 6000 });
      },
    });
  }

  private recarregarTudo(equipamentoId: number): void {
    this.listar();
    if (this.expandido() === equipamentoId) {
      this.carregarHistorico(equipamentoId);
    }
  }

  chamadoAberto(): ChamadoManutencao | null {
    return this.historico().find((c) => c.status === 'ABERTO') ?? null;
  }

  /** Soma o que já foi gasto em reparos deste equipamento. */
  custoAcumulado(): number {
    return this.historico().reduce((soma, c) => soma + (c.custoReparo ?? 0), 0);
  }
}
