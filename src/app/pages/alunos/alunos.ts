import { Component, OnDestroy, OnInit, computed, inject, signal } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatPaginatorIntl, MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatTableModule } from '@angular/material/table';
import { MatTabsModule } from '@angular/material/tabs';
import { MatTooltipModule } from '@angular/material/tooltip';
import { DatePipe } from '@angular/common';

import { LinhaReavaliacaoVencida, ResumoReavaliacaoVencida, Usuario } from '../../core/models';
import { UsuarioService } from '../../core/services/usuario.service';
import { podeExecutar } from '../../core/acesso';
import { AuthService } from '../../core/services/auth.service';
import { mensagemDeErro } from '../../core/services/erro-api';
import { PaginadorIntl } from '../../core/paginador-intl';
import { AlunoFormComponent } from './aluno-form/aluno-form';
import { VincularTreinoComponent } from './vincular-treino/vincular-treino';
import { AnamneseDialogComponent } from './anamnese-dialog/anamnese-dialog';
import { FrequenciaDialogComponent } from './frequencia-dialog/frequencia-dialog';
import { AvaliacaoFisicaDialogComponent } from './avaliacao-fisica-dialog/avaliacao-fisica-dialog';
import { ContratoDialogComponent } from './contrato-dialog/contrato-dialog';

@Component({
  selector: 'app-alunos',
  standalone: true,
  imports: [
    MatTableModule,
    MatButtonModule,
    MatIconModule,
    MatPaginatorModule,
    MatProgressSpinnerModule,
    MatTabsModule,
    MatTooltipModule,
    DatePipe,
  ],
  templateUrl: './alunos.html',
  // Rótulos do paginador em português. Providos aqui, e não na raiz:
  // importar o paginador em app.config arrastava o módulo inteiro para
  // o bundle inicial, que é carregado antes mesmo do login.
  providers: [{ provide: MatPaginatorIntl, useClass: PaginadorIntl }],
})
export class AlunosComponent implements OnInit, OnDestroy {
  private readonly usuarioService = inject(UsuarioService);
  private readonly auth = inject(AuthService);

  /** A tela é alcançável por mais perfis do que esta ação. */
  readonly podeGerenciar = computed(() =>
    podeExecutar('gerenciar-aluno', this.auth.usuario()?.tipoPerfil)
  );

  /** Cadastrar é mais restrito que editar: só a secretaria matricula. */
  readonly podeCadastrar = computed(() =>
    podeExecutar('cadastrar-aluno', this.auth.usuario()?.tipoPerfil)
  );

  /** Ler e preencher a anamnese é do mesmo grupo que monta e vincula ficha. */
  readonly podeVerAnamnese = computed(() =>
    podeExecutar('gerenciar-anamnese', this.auth.usuario()?.tipoPerfil)
  );

  /** Contrato assinado é documento administrativo/legal — admin e secretaria, não o professor. */
  readonly podeVerContrato = computed(() =>
    podeExecutar('ver-contrato', this.auth.usuario()?.tipoPerfil)
  );
  private readonly dialog = inject(MatDialog);
  private readonly snackBar = inject(MatSnackBar);

  readonly displayedColumns = ['nome', 'cpf', 'treino', 'status', 'acoes'];

  readonly alunos = signal<Usuario[]>([]);
  readonly carregando = signal(true);
  readonly erro = signal<string | null>(null);
  readonly total = signal(0);
  readonly pagina = signal(0);
  readonly tamanhoPagina = signal(20);

  /** Object URLs das fotos da página atual, por id de aluno. */
  readonly fotoPorAluno = signal<Record<number, string>>({});

  readonly colunasReavaliacaoVencida = ['aluno', 'contato', 'ultimaAvaliacao'];
  readonly resumoReavaliacaoVencida = signal<ResumoReavaliacaoVencida | null>(null);
  readonly reavaliacaoVencida = signal<LinhaReavaliacaoVencida[]>([]);
  readonly carregandoReavaliacaoVencida = signal(false);
  readonly erroReavaliacaoVencida = signal<string | null>(null);
  readonly totalReavaliacaoVencida = signal(0);
  readonly paginaReavaliacaoVencida = signal(0);
  private reavaliacaoVencidaCarregada = false;

  ngOnInit(): void {
    this.listar();
  }

  /** Só busca o alerta de reavaliação vencida quando a aba é aberta pela primeira vez. */
  aoTrocarAba(indice: number): void {
    if (indice === 1 && !this.reavaliacaoVencidaCarregada) {
      this.listarReavaliacaoVencida();
    }
  }

  ngOnDestroy(): void {
    this.liberarFotos();
  }

  listar(): void {
    this.carregando.set(true);
    this.erro.set(null);

    this.usuarioService.listar(this.pagina(), this.tamanhoPagina()).subscribe({
      next: (pagina) => {
        this.alunos.set(pagina.content);
        this.total.set(pagina.totalElements);
        this.carregando.set(false);
        this.carregarFotos(pagina.content);
      },
      error: (erro) => {
        this.erro.set(mensagemDeErro(erro, 'Não foi possível carregar os alunos.'));
        this.carregando.set(false);
      },
    });
  }

  /**
   * Busca a foto de quem tem, uma a uma.
   *
   * Não dá para apontar um `<img src>` direto no endpoint: ele exige o
   * bearer token, que só o HttpClient anexa — daí o object URL.
   */
  private carregarFotos(alunos: Usuario[]): void {
    this.liberarFotos();

    for (const aluno of alunos) {
      if (!aluno.temFoto) continue;
      this.usuarioService.buscarFoto(aluno.id).subscribe({
        next: (blob) => {
          const url = URL.createObjectURL(blob);
          this.fotoPorAluno.update((atual) => ({ ...atual, [aluno.id]: url }));
        },
        // Sem foto na tabela não impede o resto da tela de funcionar.
        error: () => {},
      });
    }
  }

  private liberarFotos(): void {
    for (const url of Object.values(this.fotoPorAluno())) {
      URL.revokeObjectURL(url);
    }
    this.fotoPorAluno.set({});
  }

  mudarPagina(evento: PageEvent): void {
    this.pagina.set(evento.pageIndex);
    this.tamanhoPagina.set(evento.pageSize);
    this.listar();
  }

  abrirModalNovoAluno(): void {
    this.abrirFormulario(null);
  }

  abrirModalEditarAluno(aluno: Usuario): void {
    this.abrirFormulario(aluno);
  }

  private abrirFormulario(aluno: Usuario | null): void {
    this.dialog
      .open(AlunoFormComponent, { width: '600px', panelClass: '!rounded-none', data: { aluno } })
      .afterClosed()
      .subscribe((salvou) => {
        if (salvou) {
          this.snackBar.open(aluno ? 'Aluno atualizado.' : 'Aluno cadastrado.', 'Fechar', { duration: 4000 });
          this.listar();
        }
      });
  }

  abrirModalVinculo(aluno: Usuario): void {
    this.dialog
      .open(VincularTreinoComponent, { width: '500px', panelClass: '!rounded-none', data: { aluno } })
      .afterClosed()
      .subscribe((salvou) => {
        if (salvou) {
          this.snackBar.open('Fichas atualizadas.', 'Fechar', { duration: 4000 });
          this.listar();
        }
      });
  }

  abrirModalAnamnese(aluno: Usuario): void {
    this.dialog
      .open(AnamneseDialogComponent, { width: '600px', panelClass: '!rounded-none', data: { aluno } })
      .afterClosed()
      .subscribe((salvou) => {
        if (salvou) {
          this.snackBar.open('Anamnese salva.', 'Fechar', { duration: 4000 });
          this.listar();
        }
      });
  }

  abrirModalFrequencia(aluno: Usuario): void {
    this.dialog.open(FrequenciaDialogComponent, { width: '520px', panelClass: '!rounded-none', data: { aluno } });
  }

  abrirModalAvaliacaoFisica(aluno: Usuario): void {
    this.dialog.open(AvaliacaoFisicaDialogComponent, {
      width: '760px',
      maxWidth: '760px',
      panelClass: '!rounded-none',
      data: { aluno },
    });
  }

  abrirModalContrato(aluno: Usuario): void {
    this.dialog.open(ContratoDialogComponent, { width: '560px', panelClass: '!rounded-none', data: { aluno } });
  }

  alternarStatus(aluno: Usuario): void {
    const acao = aluno.status === 'ATIVO' ? 'inativar' : 'reativar';
    if (!confirm(`Deseja realmente ${acao} o(a) aluno(a) ${aluno.nome}?`)) {
      return;
    }

    this.usuarioService.alternarStatus(aluno.id).subscribe({
      next: () => {
        this.snackBar.open(`Aluno ${acao === 'inativar' ? 'inativado' : 'reativado'}.`, 'Fechar', { duration: 4000 });
        this.listar();
      },
      // Antes isso ia so para o console.error e o usuario nao via nada.
      error: (erro) => this.snackBar.open(mensagemDeErro(erro), 'Fechar', { duration: 6000 }),
    });
  }

  /** Iniciais para o avatar da linha. */
  iniciais(aluno: Usuario): string {
    const partes = aluno.nome.trim().split(/\s+/).filter(Boolean);
    const primeira = partes[0]?.[0] ?? '?';
    const ultima = partes.length > 1 ? partes[partes.length - 1][0] : '';
    return (primeira + ultima).toUpperCase();
  }

  /**
   * A API guarda o CPF só com dígitos, para que a unicidade não dependa da
   * pontuação. Na leitura, a máscara volta: é assim que se confere um CPF.
   */
  cpfFormatado(aluno: Usuario): string {
    const digitos = aluno.cpf?.replace(/\D/g, '') ?? '';
    if (digitos.length !== 11) return aluno.cpf ?? '';
    return `${digitos.slice(0, 3)}.${digitos.slice(3, 6)}.${digitos.slice(6, 9)}-${digitos.slice(9)}`;
  }

  // ---------------------------------------------------------------
  // Alerta de reavaliação física vencida
  // ---------------------------------------------------------------

  listarReavaliacaoVencida(): void {
    this.carregandoReavaliacaoVencida.set(true);
    this.erroReavaliacaoVencida.set(null);

    Promise.all([
      new Promise<void>((ok, falha) => this.usuarioService.resumoReavaliacaoVencida().subscribe({
        next: (resumo) => { this.resumoReavaliacaoVencida.set(resumo); ok(); },
        error: falha,
      })),
      new Promise<void>((ok, falha) => this.usuarioService
        .reavaliacaoVencida(this.paginaReavaliacaoVencida(), 20)
        .subscribe({
          next: (pagina) => {
            this.reavaliacaoVencida.set(pagina.content);
            this.totalReavaliacaoVencida.set(pagina.totalElements);
            ok();
          },
          error: falha,
        })),
    ]).then(
      () => {
        this.carregandoReavaliacaoVencida.set(false);
        this.reavaliacaoVencidaCarregada = true;
      },
      (erro) => {
        this.erroReavaliacaoVencida.set(
          mensagemDeErro(erro, 'Não foi possível carregar o alerta de reavaliação vencida.'));
        this.carregandoReavaliacaoVencida.set(false);
      }
    );
  }

  mudarPaginaReavaliacaoVencida(evento: PageEvent): void {
    this.paginaReavaliacaoVencida.set(evento.pageIndex);
    this.listarReavaliacaoVencida();
  }
}
