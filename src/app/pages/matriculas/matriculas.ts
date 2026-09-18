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

import {
  Assinatura,
  CLASSE_SITUACAO,
  LinhaInadimplencia,
  Plano,
  ROTULO_FORMA_PAGAMENTO,
  ROTULO_SITUACAO,
  ResumoInadimplencia,
  descreverPrazo,
  situacaoDaLinhaInadimplencia,
  situacaoDaMatricula,
} from '../../core/models';
import { AssinaturaService } from '../../core/services/assinatura.service';
import { PlanoService } from '../../core/services/plano.service';
import { podeExecutar } from '../../core/acesso';
import { AuthService } from '../../core/services/auth.service';
import { mensagemDeErro } from '../../core/services/erro-api';
import { PaginadorIntl } from '../../core/paginador-intl';
import { MatriculaDialogComponent } from './matricula-dialog/matricula-dialog';
import { PlanoFormComponent } from './plano-form/plano-form';
import { AcessoDialogComponent } from './acesso-dialog/acesso-dialog';

@Component({
  selector: 'app-matriculas',
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
  templateUrl: './matriculas.html',
  providers: [{ provide: MatPaginatorIntl, useClass: PaginadorIntl }],
})
export class MatriculasComponent implements OnInit {
  private readonly assinaturaService = inject(AssinaturaService);
  private readonly auth = inject(AuthService);

  /** A tela é alcançável por mais perfis do que esta ação. */
  readonly podeGerenciarPlano = computed(() =>
    podeExecutar('gerenciar-plano', this.auth.usuario()?.tipoPerfil)
  );

  /** A tela é alcançável por mais perfis do que esta ação. */
  readonly podeCancelar = computed(() =>
    podeExecutar('cancelar-matricula', this.auth.usuario()?.tipoPerfil)
  );
  private readonly planoService = inject(PlanoService);
  private readonly dialog = inject(MatDialog);
  private readonly snackBar = inject(MatSnackBar);

  readonly colunasAssinatura = ['aluno', 'plano', 'origem', 'vencimento', 'situacao', 'acoes'];
  /** Editar e tirar de linha são da administração; sem elas a coluna vazia é ruído. */
  readonly colunasPlano = computed(() =>
    this.podeGerenciarPlano()
      ? ['nome', 'valor', 'cobranca', 'unidades', 'situacao', 'acoes']
      : ['nome', 'valor', 'cobranca', 'unidades', 'situacao']
  );

  readonly assinaturas = signal<Assinatura[]>([]);
  readonly carregandoAssinaturas = signal(true);
  readonly erroAssinaturas = signal<string | null>(null);
  readonly totalAssinaturas = signal(0);
  readonly paginaAssinaturas = signal(0);

  readonly planos = signal<Plano[]>([]);
  readonly carregandoPlanos = signal(false);
  readonly erroPlanos = signal<string | null>(null);
  readonly totalPlanos = signal(0);
  readonly paginaPlanos = signal(0);
  private planosCarregados = false;

  readonly colunasInadimplencia = ['aluno', 'plano', 'vencimento', 'situacao', 'cobranca', 'acoes'];
  readonly resumoInadimplencia = signal<ResumoInadimplencia | null>(null);
  readonly linhasInadimplencia = signal<LinhaInadimplencia[]>([]);
  readonly carregandoInadimplencia = signal(false);
  readonly erroInadimplencia = signal<string | null>(null);
  readonly totalInadimplencia = signal(0);
  readonly paginaInadimplencia = signal(0);
  private inadimplenciaCarregada = false;

  ngOnInit(): void {
    this.listarAssinaturas();
  }

  listarAssinaturas(): void {
    this.carregandoAssinaturas.set(true);
    this.erroAssinaturas.set(null);

    this.assinaturaService.listar(this.paginaAssinaturas(), 20).subscribe({
      next: (pagina) => {
        this.assinaturas.set(pagina.content);
        this.totalAssinaturas.set(pagina.totalElements);
        this.carregandoAssinaturas.set(false);
      },
      error: (erro) => {
        this.erroAssinaturas.set(mensagemDeErro(erro, 'Não foi possível carregar as matrículas.'));
        this.carregandoAssinaturas.set(false);
      },
    });
  }

  listarPlanos(): void {
    this.carregandoPlanos.set(true);
    this.erroPlanos.set(null);

    this.planoService.listar(this.paginaPlanos(), 20).subscribe({
      next: (pagina) => {
        this.planos.set(pagina.content);
        this.totalPlanos.set(pagina.totalElements);
        this.carregandoPlanos.set(false);
        this.planosCarregados = true;
      },
      error: (erro) => {
        this.erroPlanos.set(mensagemDeErro(erro, 'Não foi possível carregar os planos.'));
        this.carregandoPlanos.set(false);
      },
    });
  }

  /** Só busca os planos (e a inadimplência) quando a aba é aberta pela primeira vez. */
  aoTrocarAba(indice: number): void {
    if (indice === 1 && !this.planosCarregados) {
      this.listarPlanos();
    }
    if (indice === 2 && !this.inadimplenciaCarregada) {
      this.listarInadimplencia();
    }
  }

  mudarPaginaAssinaturas(evento: PageEvent): void {
    this.paginaAssinaturas.set(evento.pageIndex);
    this.listarAssinaturas();
  }

  mudarPaginaPlanos(evento: PageEvent): void {
    this.paginaPlanos.set(evento.pageIndex);
    this.listarPlanos();
  }

  mudarPaginaInadimplencia(evento: PageEvent): void {
    this.paginaInadimplencia.set(evento.pageIndex);
    this.listarInadimplencia();
  }

  // ---------------------------------------------------------------
  // Matrículas
  // ---------------------------------------------------------------

  abrirMatricula(): void {
    this.dialog
      .open(MatriculaDialogComponent, { width: '620px', maxWidth: '94vw' })
      .afterClosed()
      .subscribe((assinatura: Assinatura | undefined) => {
        if (assinatura) {
          this.snackBar.open(
            `${assinatura.alunoNome} matriculado(a) em "${assinatura.planoNome}".`,
            'Fechar', { duration: 5000 });
          this.paginaAssinaturas.set(0);
          this.listarAssinaturas();
        }
      });
  }

  abrirConferenciaDeAcesso(): void {
    this.dialog.open(AcessoDialogComponent, { width: '600px', maxWidth: '94vw' });
  }

  renovar(assinatura: Assinatura, evento: Event): void {
    evento.stopPropagation();

    this.assinaturaService.renovar(assinatura.id).subscribe({
      next: (renovada) => {
        // A nova data vem da API: ela conta a partir do vencimento atual
        // ou de hoje, o que for mais tarde.
        this.snackBar.open(
          `Renovada. ${renovada.alunoNome} tem acesso até ${this.formatar(renovada.dataVencimento)}.`,
          'Fechar', { duration: 5000 });
        this.listarAssinaturas();
      },
      error: (erro) => this.snackBar.open(mensagemDeErro(erro), 'Fechar', { duration: 6000 }),
    });
  }

  marcarInadimplente(assinatura: Assinatura, evento: Event): void {
    evento.stopPropagation();

    if (!confirm(`Marcar a matrícula de ${assinatura.alunoNome} como inadimplente?\n\n` +
                 'O acesso é interrompido, mas a matrícula continua — renovar devolve o acesso.')) {
      return;
    }

    this.assinaturaService.marcarInadimplente(assinatura.id).subscribe({
      next: () => {
        this.snackBar.open('Matrícula em atraso. O acesso está interrompido.', 'Fechar', { duration: 5000 });
        this.listarAssinaturas();
      },
      error: (erro) => this.snackBar.open(mensagemDeErro(erro), 'Fechar', { duration: 6000 }),
    });
  }

  cancelar(assinatura: Assinatura, evento: Event): void {
    evento.stopPropagation();

    if (!confirm(`Cancelar a matrícula de ${assinatura.alunoNome} no plano "${assinatura.planoNome}"?\n\n` +
                 'Cancelar é definitivo: para voltar, o aluno precisa ser matriculado de novo.')) {
      return;
    }

    this.assinaturaService.cancelar(assinatura.id).subscribe({
      next: () => {
        this.snackBar.open('Matrícula cancelada.', 'Fechar', { duration: 5000 });
        this.listarAssinaturas();
      },
      error: (erro) => this.snackBar.open(mensagemDeErro(erro), 'Fechar', { duration: 6000 }),
    });
  }

  // ---------------------------------------------------------------
  // Inadimplência
  // ---------------------------------------------------------------

  listarInadimplencia(): void {
    this.carregandoInadimplencia.set(true);
    this.erroInadimplencia.set(null);

    Promise.all([
      new Promise<void>((ok, falha) => this.assinaturaService.resumoInadimplencia().subscribe({
        next: (resumo) => { this.resumoInadimplencia.set(resumo); ok(); },
        error: falha,
      })),
      new Promise<void>((ok, falha) => this.assinaturaService
        .inadimplencia(this.paginaInadimplencia(), 20)
        .subscribe({
          next: (pagina) => {
            this.linhasInadimplencia.set(pagina.content);
            this.totalInadimplencia.set(pagina.totalElements);
            ok();
          },
          error: falha,
        })),
    ]).then(
      () => {
        this.carregandoInadimplencia.set(false);
        this.inadimplenciaCarregada = true;
      },
      (erro) => {
        this.erroInadimplencia.set(
          mensagemDeErro(erro, 'Não foi possível carregar o relatório de inadimplência.'));
        this.carregandoInadimplencia.set(false);
      }
    );
  }

  /** Mesmo botão de renovar da aba Matrículas: quita a cobrança pendente e empurra o vencimento. */
  confirmarPagamento(linha: LinhaInadimplencia, evento: Event): void {
    evento.stopPropagation();

    this.assinaturaService.renovar(linha.assinaturaId).subscribe({
      next: (renovada) => {
        this.snackBar.open(
          `Pagamento confirmado. ${renovada.alunoNome} tem acesso até ${this.formatar(renovada.dataVencimento)}.`,
          'Fechar', { duration: 5000 });
        this.listarInadimplencia();
      },
      error: (erro) => this.snackBar.open(mensagemDeErro(erro), 'Fechar', { duration: 6000 }),
    });
  }

  rotuloSituacaoInadimplencia(linha: LinhaInadimplencia): string {
    return ROTULO_SITUACAO[situacaoDaLinhaInadimplencia(linha)];
  }

  classeSituacaoInadimplencia(linha: LinhaInadimplencia): string {
    return CLASSE_SITUACAO[situacaoDaLinhaInadimplencia(linha)];
  }

  prazoDaLinha(linha: LinhaInadimplencia): string {
    return descreverPrazo(linha.diasParaVencer);
  }

  rotuloFormaPagamento(linha: LinhaInadimplencia): string {
    return linha.formaPagamento ? ROTULO_FORMA_PAGAMENTO[linha.formaPagamento] : '—';
  }

  // ---------------------------------------------------------------
  // Planos
  // ---------------------------------------------------------------

  abrirFormularioPlano(plano: Plano | null): void {
    this.dialog
      .open(PlanoFormComponent, { width: '600px', maxWidth: '94vw', data: { plano } })
      .afterClosed()
      .subscribe((salvou) => {
        if (salvou) {
          this.snackBar.open(plano ? 'Plano atualizado.' : 'Plano cadastrado.', 'Fechar', { duration: 4000 });
          this.listarPlanos();
        }
      });
  }

  alternarAtivoPlano(plano: Plano, evento: Event): void {
    evento.stopPropagation();

    const acao = plano.ativo ? 'tirar de linha' : 'voltar a oferecer';
    if (!confirm(`Deseja ${acao} o plano "${plano.nome}"?\n\n` +
                 'Quem já está matriculado continua nele — muda só o que aparece para novas matrículas.')) {
      return;
    }

    this.planoService.alternarAtivo(plano.id).subscribe({
      next: () => {
        this.snackBar.open(plano.ativo ? 'Plano fora de linha.' : 'Plano reativado.', 'Fechar', { duration: 4000 });
        this.listarPlanos();
      },
      error: (erro) => this.snackBar.open(mensagemDeErro(erro), 'Fechar', { duration: 6000 }),
    });
  }

  // ---------------------------------------------------------------
  // Apoio à leitura da tabela
  // ---------------------------------------------------------------

  rotuloSituacao(assinatura: Assinatura): string {
    return ROTULO_SITUACAO[situacaoDaMatricula(assinatura, this.hoje())];
  }

  classeSituacao(assinatura: Assinatura): string {
    return CLASSE_SITUACAO[situacaoDaMatricula(assinatura, this.hoje())];
  }

  rotuloOrigem(assinatura: Assinatura): string {
    return { DIRETO: 'Direta', GYMPASS: 'Gympass', TOTALPASS: 'TotalPass' }[assinatura.origem];
  }

  rotuloCobranca(plano: Plano): string {
    return plano.tipoCobranca === 'RECORRENTE' ? 'Mensal · vence a cada mês' : 'Anual · vence a cada 12 meses';
  }

  unidadesDoPlano(plano: Plano): string {
    return plano.unidades.map((u) => u.nome).join(', ');
  }

  /** Hoje no fuso local: toISOString daria UTC e podia adiantar um dia. */
  private hoje(): string {
    const agora = new Date();
    const mes = `${agora.getMonth() + 1}`.padStart(2, '0');
    const dia = `${agora.getDate()}`.padStart(2, '0');
    return `${agora.getFullYear()}-${mes}-${dia}`;
  }

  private formatar(iso: string): string {
    const [ano, mes, dia] = iso.split('-');
    return `${dia}/${mes}/${ano}`;
  }
}
