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
  LinhaAlunoInativo,
  LinhaComissaoIndicacao,
  LinhaInadimplencia,
  LinhaIndicacao,
  LinhaMotivoCancelamento,
  Plano,
  ROTULO_FORMA_PAGAMENTO,
  ROTULO_MOTIVO_CANCELAMENTO,
  ROTULO_SITUACAO,
  ResumoAlunosInativos,
  ResumoComissoesIndicacao,
  ResumoInadimplencia,
  descreverInatividade,
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
import { CancelarMatriculaDialogComponent } from './cancelar-matricula-dialog/cancelar-matricula-dialog';

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

  readonly colunasInadimplencia = ['aluno', 'plano', 'vencimento', 'situacao', 'cobranca', 'lembrete', 'acoes'];
  readonly colunasIndicacoes = ['posicao', 'aluno', 'quantidade'];
  readonly resumoInadimplencia = signal<ResumoInadimplencia | null>(null);
  readonly linhasInadimplencia = signal<LinhaInadimplencia[]>([]);
  readonly carregandoInadimplencia = signal(false);
  readonly erroInadimplencia = signal<string | null>(null);
  readonly totalInadimplencia = signal(0);
  readonly paginaInadimplencia = signal(0);
  private inadimplenciaCarregada = false;

  readonly indicacoes = signal<LinhaIndicacao[]>([]);
  readonly carregandoIndicacoes = signal(false);
  readonly erroIndicacoes = signal<string | null>(null);
  private indicacoesCarregadas = false;

  readonly colunasComissoes = ['indicador', 'indicado', 'valor', 'dataCriacao', 'acoes'];
  readonly resumoComissoes = signal<ResumoComissoesIndicacao | null>(null);
  readonly comissoesIndicacao = signal<LinhaComissaoIndicacao[]>([]);
  readonly carregandoComissoes = signal(false);
  readonly erroComissoes = signal<string | null>(null);

  readonly colunasMotivosCancelamento = ['posicao', 'motivo', 'quantidade'];
  readonly motivosCancelamento = signal<LinhaMotivoCancelamento[]>([]);
  readonly carregandoMotivosCancelamento = signal(false);
  readonly erroMotivosCancelamento = signal<string | null>(null);
  private motivosCancelamentoCarregados = false;

  readonly colunasInatividade = ['aluno', 'plano', 'vencimento', 'ultimoCheckin'];
  readonly resumoInatividade = signal<ResumoAlunosInativos | null>(null);
  readonly alunosInativos = signal<LinhaAlunoInativo[]>([]);
  readonly carregandoInatividade = signal(false);
  readonly erroInatividade = signal<string | null>(null);
  readonly totalInatividade = signal(0);
  readonly paginaInatividade = signal(0);
  private inatividadeCarregada = false;

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

  /** Só busca os planos (a inadimplência, as indicações) quando a aba é aberta pela primeira vez. */
  aoTrocarAba(indice: number): void {
    if (indice === 1 && !this.planosCarregados) {
      this.listarPlanos();
    }
    if (indice === 2 && !this.inadimplenciaCarregada) {
      this.listarInadimplencia();
    }
    if (indice === 3 && !this.indicacoesCarregadas) {
      this.listarIndicacoes();
      this.listarComissoesIndicacao();
    }
    if (indice === 4 && !this.motivosCancelamentoCarregados) {
      this.listarMotivosCancelamento();
    }
    if (indice === 5 && !this.inatividadeCarregada) {
      this.listarAlunosInativos();
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

  mudarPaginaInatividade(evento: PageEvent): void {
    this.paginaInatividade.set(evento.pageIndex);
    this.listarAlunosInativos();
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

    this.dialog
      .open(CancelarMatriculaDialogComponent, { width: '520px', maxWidth: '94vw', data: { assinatura } })
      .afterClosed()
      .subscribe((cancelada: Assinatura | undefined) => {
        if (cancelada) {
          this.snackBar.open('Matrícula cancelada.', 'Fechar', { duration: 5000 });
          this.listarAssinaturas();
          // O motivo acabou de mudar o ranking; refaz na próxima vez que a aba abrir.
          this.motivosCancelamentoCarregados = false;
        }
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

  /** "WhatsApp" ou "E-mail" — o rótulo que a tela mostra, não o valor cru do enum. */
  rotuloCanalLembrete(linha: LinhaInadimplencia): string {
    return linha.ultimoLembreteCanal === 'WHATSAPP' ? 'WhatsApp' : 'E-mail';
  }

  // ---------------------------------------------------------------
  // Alerta de inatividade
  // ---------------------------------------------------------------

  listarAlunosInativos(): void {
    this.carregandoInatividade.set(true);
    this.erroInatividade.set(null);

    Promise.all([
      new Promise<void>((ok, falha) => this.assinaturaService.resumoAlunosInativos().subscribe({
        next: (resumo) => { this.resumoInatividade.set(resumo); ok(); },
        error: falha,
      })),
      new Promise<void>((ok, falha) => this.assinaturaService
        .alunosInativos(this.paginaInatividade(), 20)
        .subscribe({
          next: (pagina) => {
            this.alunosInativos.set(pagina.content);
            this.totalInatividade.set(pagina.totalElements);
            ok();
          },
          error: falha,
        })),
    ]).then(
      () => {
        this.carregandoInatividade.set(false);
        this.inatividadeCarregada = true;
      },
      (erro) => {
        this.erroInatividade.set(
          mensagemDeErro(erro, 'Não foi possível carregar o alerta de inatividade.'));
        this.carregandoInatividade.set(false);
      }
    );
  }

  descreverInatividadeDaLinha(linha: LinhaAlunoInativo): string {
    return descreverInatividade(linha.diasSemCheckin);
  }

  // ---------------------------------------------------------------
  // Programa de indicação
  // ---------------------------------------------------------------

  listarIndicacoes(): void {
    this.carregandoIndicacoes.set(true);
    this.erroIndicacoes.set(null);

    this.assinaturaService.indicacoes().subscribe({
      next: (linhas) => {
        this.indicacoes.set(linhas);
        this.carregandoIndicacoes.set(false);
        this.indicacoesCarregadas = true;
      },
      error: (erro) => {
        this.erroIndicacoes.set(mensagemDeErro(erro, 'Não foi possível carregar o ranking de indicações.'));
        this.carregandoIndicacoes.set(false);
      },
    });
  }

  listarComissoesIndicacao(): void {
    this.carregandoComissoes.set(true);
    this.erroComissoes.set(null);

    Promise.all([
      new Promise<void>((ok, falha) => this.assinaturaService.resumoComissoesIndicacao().subscribe({
        next: (resumo) => { this.resumoComissoes.set(resumo); ok(); },
        error: falha,
      })),
      new Promise<void>((ok, falha) => this.assinaturaService.comissoesIndicacaoPendentes(0, 20).subscribe({
        next: (pagina) => { this.comissoesIndicacao.set(pagina.content); ok(); },
        error: falha,
      })),
    ]).then(
      () => this.carregandoComissoes.set(false),
      (erro) => {
        this.erroComissoes.set(mensagemDeErro(erro, 'Não foi possível carregar as comissões de indicação.'));
        this.carregandoComissoes.set(false);
      }
    );
  }

  aplicarComissao(comissao: LinhaComissaoIndicacao): void {
    if (!confirm(`Aplicar o desconto de ${comissao.valor.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })} ` +
                 `na próxima cobrança de ${comissao.indicadorNome}?`)) {
      return;
    }

    this.assinaturaService.aplicarComissaoIndicacao(comissao.id).subscribe({
      next: () => {
        this.snackBar.open('Desconto aplicado na cobrança do indicador.', 'Fechar', { duration: 5000 });
        this.listarComissoesIndicacao();
      },
      error: (erro) => this.snackBar.open(mensagemDeErro(erro), 'Fechar', { duration: 6000 }),
    });
  }

  // ---------------------------------------------------------------
  // Motivos de cancelamento
  // ---------------------------------------------------------------

  listarMotivosCancelamento(): void {
    this.carregandoMotivosCancelamento.set(true);
    this.erroMotivosCancelamento.set(null);

    this.assinaturaService.motivosCancelamento().subscribe({
      next: (linhas) => {
        this.motivosCancelamento.set(linhas);
        this.carregandoMotivosCancelamento.set(false);
        this.motivosCancelamentoCarregados = true;
      },
      error: (erro) => {
        this.erroMotivosCancelamento.set(
          mensagemDeErro(erro, 'Não foi possível carregar os motivos de cancelamento.'));
        this.carregandoMotivosCancelamento.set(false);
      },
    });
  }

  rotuloMotivoCancelamento(linha: LinhaMotivoCancelamento): string {
    return ROTULO_MOTIVO_CANCELAMENTO[linha.motivo];
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
    return { DIRETO: 'Direta', GYMPASS: 'Gympass', TOTALPASS: 'TotalPass', INDICACAO: 'Indicação' }[assinatura.origem];
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
