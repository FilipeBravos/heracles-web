import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { DatePipe } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatPaginatorIntl, MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSelectModule } from '@angular/material/select';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatTableModule } from '@angular/material/table';
import { MatTabsModule } from '@angular/material/tabs';
import { MatTooltipModule } from '@angular/material/tooltip';

import {
  AgendamentoPersonal,
  AulaGrupo,
  DIAS_SEMANA,
  HorarioProfessor,
  LinhaAvaliacaoProfessor,
  LinhaCancelamentoProfessor,
  LinhaNoShowPorHorario,
  LinhaOcupacaoPersonal,
  LinhaSessoesPorProfessor,
  PainelPresenca,
  ResultadoInscricao,
  ROTULO_DIA_SEMANA,
  Unidade,
  Usuario,
} from '../../core/models';
import { AgendaService } from '../../core/services/agenda.service';
import { UnidadeService } from '../../core/services/unidade.service';
import { UsuarioService } from '../../core/services/usuario.service';
import { AuthService } from '../../core/services/auth.service';
import { podeExecutar } from '../../core/acesso';
import { mensagemDeErro } from '../../core/services/erro-api';
import { PaginadorIntl } from '../../core/paginador-intl';
import { AulaFormComponent } from './aula-form/aula-form';
import { PersonalFormComponent } from './personal-form/personal-form';
import { InscricaoDialogComponent } from './inscricao-dialog/inscricao-dialog';
import { PresencaDialogComponent } from './presenca-dialog/presenca-dialog';

@Component({
  selector: 'app-agenda',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    MatTableModule,
    MatButtonModule,
    MatFormFieldModule,
    MatSelectModule,
    MatInputModule,
    MatIconModule,
    MatPaginatorModule,
    MatProgressSpinnerModule,
    MatTabsModule,
    MatTooltipModule,
    DatePipe,
  ],
  templateUrl: './agenda.html',
  providers: [{ provide: MatPaginatorIntl, useClass: PaginadorIntl }],
})
export class AgendaComponent implements OnInit {
  private readonly agendaService = inject(AgendaService);
  private readonly usuarioService = inject(UsuarioService);
  private readonly unidadeService = inject(UnidadeService);
  private readonly auth = inject(AuthService);
  private readonly dialog = inject(MatDialog);
  private readonly snackBar = inject(MatSnackBar);
  private readonly fb = inject(FormBuilder);

  readonly podeGerenciarAula = computed(() =>
    podeExecutar('gerenciar-aula-grupo', this.auth.usuario()?.tipoPerfil));
  readonly podeMarcarVaga = computed(() =>
    podeExecutar('marcar-vaga-aula', this.auth.usuario()?.tipoPerfil));
  readonly podeGerenciarPersonal = computed(() =>
    podeExecutar('gerenciar-personal', this.auth.usuario()?.tipoPerfil));
  readonly podeVerAvaliacoesPersonal = computed(() =>
    podeExecutar('ver-avaliacoes-personal', this.auth.usuario()?.tipoPerfil));
  readonly podeVerRelatorioPresenca = computed(() =>
    podeExecutar('ver-relatorio-presenca', this.auth.usuario()?.tipoPerfil));
  readonly podeGerenciarHorario = computed(() =>
    podeExecutar('gerenciar-horario-professor', this.auth.usuario()?.tipoPerfil));

  readonly dias = DIAS_SEMANA;
  readonly rotuloDia = ROTULO_DIA_SEMANA;

  // ---------------------------------------------------------------
  // Aulas em grupo
  // ---------------------------------------------------------------
  readonly colunasAula = ['nome', 'professor', 'unidade', 'dataHora', 'vagas', 'status', 'acoes'];
  readonly aulas = signal<AulaGrupo[]>([]);
  readonly carregandoAulas = signal(true);
  readonly erroAulas = signal<string | null>(null);
  readonly totalAulas = signal(0);
  readonly paginaAulas = signal(0);

  // ---------------------------------------------------------------
  // Personal
  // ---------------------------------------------------------------
  readonly colunasPersonal =
    ['aluno', 'professor', 'unidade', 'dataHora', 'observacoes', 'nota', 'status', 'acoes'];
  readonly sessoesPersonal = signal<AgendamentoPersonal[]>([]);
  readonly carregandoPersonal = signal(false);
  readonly erroPersonal = signal<string | null>(null);
  readonly totalPersonal = signal(0);
  readonly paginaPersonal = signal(0);
  private personalCarregado = false;

  readonly colunasAvaliacoes = ['posicao', 'professor', 'notaMedia', 'quantidade'];
  readonly avaliacoesPorProfessor = signal<LinhaAvaliacaoProfessor[]>([]);
  readonly carregandoAvaliacoes = signal(false);
  readonly erroAvaliacoes = signal<string | null>(null);
  private avaliacoesCarregadas = false;

  readonly colunasCancelamentos = ['posicao', 'professor', 'total', 'emCimaDaHora', 'taxa'];
  readonly cancelamentosPorProfessor = signal<LinhaCancelamentoProfessor[]>([]);
  readonly carregandoCancelamentos = signal(false);
  readonly erroCancelamentos = signal<string | null>(null);
  private cancelamentosCarregados = false;

  readonly colunasOcupacao = ['posicao', 'professor', 'disponiveis', 'ocupadas', 'taxa'];
  readonly ocupacaoPorProfessor = signal<LinhaOcupacaoPersonal[]>([]);
  readonly carregandoOcupacao = signal(false);
  readonly erroOcupacao = signal<string | null>(null);
  private ocupacaoCarregada = false;

  readonly colunasSessoesRealizadas = ['posicao', 'professor', 'quantidade'];
  readonly sessoesRealizadasPorProfessor = signal<LinhaSessoesPorProfessor[]>([]);
  readonly carregandoSessoesRealizadas = signal(false);
  readonly erroSessoesRealizadas = signal<string | null>(null);
  private sessoesRealizadasCarregadas = false;

  readonly colunasFaltosos = ['posicao', 'aluno', 'faltas', 'presencas'];
  readonly relatorioPresenca = signal<PainelPresenca | null>(null);
  readonly carregandoRelatorioPresenca = signal(false);
  readonly erroRelatorioPresenca = signal<string | null>(null);
  private relatorioPresencaCarregado = false;

  readonly colunasNoShow = ['aula', 'diaHorario', 'ocorrencias', 'taxaNoShow'];
  readonly noShowPorHorario = signal<LinhaNoShowPorHorario[]>([]);
  readonly carregandoNoShow = signal(false);
  readonly erroNoShow = signal<string | null>(null);
  private noShowCarregado = false;

  // ---------------------------------------------------------------
  // Horários de professor
  // ---------------------------------------------------------------
  readonly colunasHorario = ['diaSemana', 'horario', 'unidade', 'acoes'];
  readonly professores = signal<Usuario[]>([]);
  readonly unidades = signal<Unidade[]>([]);
  readonly professorSelecionado = signal<number | null>(null);
  readonly horarios = signal<HorarioProfessor[]>([]);
  readonly carregandoHorarios = signal(false);
  readonly erroHorarios = signal<string | null>(null);
  private horariosCarregados = false;

  readonly formHorario = this.fb.nonNullable.group({
    diaSemana: ['SEGUNDA' as HorarioProfessor['diaSemana'], Validators.required],
    horaInicio: ['08:00', Validators.required],
    horaFim: ['12:00', Validators.required],
    unidadeId: [null as number | null, Validators.required],
  });

  ngOnInit(): void {
    this.listarAulas();
  }

  aoTrocarAba(indice: number): void {
    if (indice === 1 && !this.personalCarregado) {
      this.listarPersonal();
    }
    if (indice === 2 && !this.horariosCarregados) {
      this.carregarSuporteDeHorarios();
    }
    if (indice === 3 && !this.avaliacoesCarregadas) {
      this.listarAvaliacoesPorProfessor();
    }
    if (indice === 3 && !this.cancelamentosCarregados) {
      this.listarCancelamentosPorProfessor();
    }
    if (indice === 3 && !this.ocupacaoCarregada) {
      this.listarOcupacaoPorProfessor();
    }
    if (indice === 3 && !this.sessoesRealizadasCarregadas) {
      this.listarSessoesRealizadasPorProfessor();
    }
    if (indice === 4 && !this.relatorioPresencaCarregado) {
      this.carregarRelatorioPresenca();
    }
    if (indice === 4 && !this.noShowCarregado) {
      this.carregarNoShowPorHorario();
    }
  }

  // ---------------------------------------------------------------
  // Aulas em grupo
  // ---------------------------------------------------------------

  listarAulas(): void {
    this.carregandoAulas.set(true);
    this.erroAulas.set(null);

    this.agendaService.listarAulas(this.paginaAulas(), 20).subscribe({
      next: (pagina) => {
        this.aulas.set(pagina.content);
        this.totalAulas.set(pagina.totalElements);
        this.carregandoAulas.set(false);
      },
      error: (erro) => {
        this.erroAulas.set(mensagemDeErro(erro, 'Não foi possível carregar as aulas.'));
        this.carregandoAulas.set(false);
      },
    });
  }

  mudarPaginaAulas(evento: PageEvent): void {
    this.paginaAulas.set(evento.pageIndex);
    this.listarAulas();
  }

  abrirFormularioAula(): void {
    this.dialog
      .open(AulaFormComponent, { width: '560px', maxWidth: '94vw' })
      .afterClosed()
      .subscribe((aula: AulaGrupo | undefined) => {
        if (aula) {
          this.snackBar.open(`Aula "${aula.nome}" criada.`, 'Fechar', { duration: 4000 });
          this.paginaAulas.set(0);
          this.listarAulas();
        }
      });
  }

  cancelarAula(aula: AulaGrupo): void {
    if (!confirm(`Cancelar a aula "${aula.nome}" de ${this.formatarDataHora(aula.dataHora)}?`)) {
      return;
    }

    this.agendaService.cancelarAula(aula.id).subscribe({
      next: () => {
        this.snackBar.open('Aula cancelada.', 'Fechar', { duration: 4000 });
        this.listarAulas();
      },
      error: (erro) => this.snackBar.open(mensagemDeErro(erro), 'Fechar', { duration: 6000 }),
    });
  }

  abrirMarcarVaga(aula: AulaGrupo): void {
    this.dialog
      .open(InscricaoDialogComponent, { width: '480px', maxWidth: '94vw', data: { aula, modo: 'marcar' } })
      .afterClosed()
      .subscribe((resultado: ResultadoInscricao | undefined) => {
        if (resultado) {
          const mensagem = resultado.status === 'EM_ESPERA'
            ? `Turma lotada — aluno entrou na lista de espera (posição ${resultado.posicaoEspera}).`
            : 'Vaga marcada.';
          this.snackBar.open(mensagem, 'Fechar', { duration: 5000 });
          this.listarAulas();
        }
      });
  }

  abrirDesmarcarVaga(aula: AulaGrupo): void {
    this.dialog
      .open(InscricaoDialogComponent, { width: '480px', maxWidth: '94vw', data: { aula, modo: 'desmarcar' } })
      .afterClosed()
      .subscribe((confirmou) => {
        if (confirmou) {
          this.snackBar.open('Vaga desmarcada.', 'Fechar', { duration: 4000 });
          this.listarAulas();
        }
      });
  }

  /**
   * Só o próprio professor confirma quem compareceu — e só depois que a
   * aula aconteceu, mesma regra de podeMarcarRealizada pro personal.
   */
  podeConfirmarPresenca(aula: AulaGrupo): boolean {
    if (aula.status !== 'ATIVA') return false;
    if (this.auth.usuario()?.tipoPerfil !== 'PROFESSOR') return false;
    if (aula.professorId !== this.auth.usuario()?.id) return false;

    const fim = new Date(aula.dataHora).getTime() + aula.duracaoMinutos * 60_000;
    return fim <= Date.now();
  }

  /** A presença não muda a ocupação da turma, então fechar o diálogo não precisa recarregar a agenda. */
  abrirConfirmarPresenca(aula: AulaGrupo): void {
    this.dialog.open(PresencaDialogComponent, { width: '520px', maxWidth: '94vw', data: { aula } });
  }

  // ---------------------------------------------------------------
  // Personal
  // ---------------------------------------------------------------

  listarPersonal(): void {
    this.carregandoPersonal.set(true);
    this.erroPersonal.set(null);

    this.agendaService.listarSessoesPersonal(this.paginaPersonal(), 20).subscribe({
      next: (pagina) => {
        this.sessoesPersonal.set(pagina.content);
        this.totalPersonal.set(pagina.totalElements);
        this.carregandoPersonal.set(false);
        this.personalCarregado = true;
      },
      error: (erro) => {
        this.erroPersonal.set(mensagemDeErro(erro, 'Não foi possível carregar as sessões de personal.'));
        this.carregandoPersonal.set(false);
      },
    });
  }

  mudarPaginaPersonal(evento: PageEvent): void {
    this.paginaPersonal.set(evento.pageIndex);
    this.listarPersonal();
  }

  abrirFormularioPersonal(): void {
    this.dialog
      .open(PersonalFormComponent, { width: '600px', maxWidth: '94vw' })
      .afterClosed()
      .subscribe((sessao: AgendamentoPersonal | undefined) => {
        if (sessao) {
          this.snackBar.open(
            `Sessão de personal agendada para ${sessao.alunoNome}.`, 'Fechar', { duration: 4000 });
          this.paginaPersonal.set(0);
          this.listarPersonal();
        }
      });
  }

  cancelarSessaoPersonal(sessao: AgendamentoPersonal): void {
    if (!confirm(`Cancelar a sessão de personal de ${sessao.alunoNome} com ${sessao.professorNome}?`)) {
      return;
    }

    this.agendaService.cancelarSessaoPersonal(sessao.id).subscribe({
      next: () => {
        this.snackBar.open('Sessão cancelada.', 'Fechar', { duration: 4000 });
        this.listarPersonal();
      },
      error: (erro) => this.snackBar.open(mensagemDeErro(erro), 'Fechar', { duration: 6000 }),
    });
  }

  /**
   * Só o próprio professor confirma que a sessão aconteceu — e só depois
   * que o horário passou, senão a API recusa mesmo.
   */
  podeMarcarRealizada(sessao: AgendamentoPersonal): boolean {
    if (sessao.status !== 'AGENDADO') return false;
    if (this.auth.usuario()?.tipoPerfil !== 'PROFESSOR') return false;
    if (sessao.professorId !== this.auth.usuario()?.id) return false;

    const fim = new Date(sessao.dataHora).getTime() + sessao.duracaoMinutos * 60_000;
    return fim <= Date.now();
  }

  marcarSessaoPersonalRealizada(sessao: AgendamentoPersonal): void {
    this.agendaService.marcarSessaoPersonalRealizada(sessao.id).subscribe({
      next: () => {
        this.snackBar.open('Sessão confirmada como realizada.', 'Fechar', { duration: 4000 });
        this.listarPersonal();
      },
      error: (erro) => this.snackBar.open(mensagemDeErro(erro), 'Fechar', { duration: 6000 }),
    });
  }

  rotuloStatusPersonal(status: AgendamentoPersonal['status']): string {
    return { AGENDADO: 'Agendada', REALIZADA: 'Realizada', CANCELADO: 'Cancelada' }[status];
  }

  classeStatusPersonal(status: AgendamentoPersonal['status']): string {
    return status === 'CANCELADO' ? 'h-etiqueta--neutra' : 'h-etiqueta--ok';
  }

  // ---------------------------------------------------------------
  // Avaliações de personal
  // ---------------------------------------------------------------

  listarAvaliacoesPorProfessor(): void {
    this.carregandoAvaliacoes.set(true);
    this.erroAvaliacoes.set(null);

    this.agendaService.avaliacoesPorProfessor().subscribe({
      next: (linhas) => {
        this.avaliacoesPorProfessor.set(linhas);
        this.carregandoAvaliacoes.set(false);
        this.avaliacoesCarregadas = true;
      },
      error: (erro) => {
        this.erroAvaliacoes.set(mensagemDeErro(erro, 'Não foi possível carregar as avaliações.'));
        this.carregandoAvaliacoes.set(false);
      },
    });
  }

  listarCancelamentosPorProfessor(): void {
    this.carregandoCancelamentos.set(true);
    this.erroCancelamentos.set(null);

    this.agendaService.cancelamentosPorProfessor().subscribe({
      next: (linhas) => {
        this.cancelamentosPorProfessor.set(linhas);
        this.carregandoCancelamentos.set(false);
        this.cancelamentosCarregados = true;
      },
      error: (erro) => {
        this.erroCancelamentos.set(mensagemDeErro(erro, 'Não foi possível carregar os cancelamentos.'));
        this.carregandoCancelamentos.set(false);
      },
    });
  }

  listarOcupacaoPorProfessor(): void {
    this.carregandoOcupacao.set(true);
    this.erroOcupacao.set(null);

    this.agendaService.ocupacaoPorProfessor().subscribe({
      next: (linhas) => {
        this.ocupacaoPorProfessor.set(linhas);
        this.carregandoOcupacao.set(false);
        this.ocupacaoCarregada = true;
      },
      error: (erro) => {
        this.erroOcupacao.set(mensagemDeErro(erro, 'Não foi possível carregar a ocupação da agenda.'));
        this.carregandoOcupacao.set(false);
      },
    });
  }

  listarSessoesRealizadasPorProfessor(): void {
    this.carregandoSessoesRealizadas.set(true);
    this.erroSessoesRealizadas.set(null);

    this.agendaService.sessoesRealizadasPorProfessor().subscribe({
      next: (linhas) => {
        this.sessoesRealizadasPorProfessor.set(linhas);
        this.carregandoSessoesRealizadas.set(false);
        this.sessoesRealizadasCarregadas = true;
      },
      error: (erro) => {
        this.erroSessoesRealizadas.set(mensagemDeErro(erro, 'Não foi possível carregar as sessões realizadas.'));
        this.carregandoSessoesRealizadas.set(false);
      },
    });
  }

  // ---------------------------------------------------------------
  // Relatório de presença
  // ---------------------------------------------------------------

  carregarRelatorioPresenca(): void {
    this.carregandoRelatorioPresenca.set(true);
    this.erroRelatorioPresenca.set(null);

    this.agendaService.relatorioPresenca(90).subscribe({
      next: (relatorio) => {
        this.relatorioPresenca.set(relatorio);
        this.carregandoRelatorioPresenca.set(false);
        this.relatorioPresencaCarregado = true;
      },
      error: (erro) => {
        this.erroRelatorioPresenca.set(mensagemDeErro(erro, 'Não foi possível carregar o relatório de presença.'));
        this.carregandoRelatorioPresenca.set(false);
      },
    });
  }

  carregarNoShowPorHorario(): void {
    this.carregandoNoShow.set(true);
    this.erroNoShow.set(null);

    this.agendaService.relatorioNoShowPorHorario(90).subscribe({
      next: (linhas) => {
        this.noShowPorHorario.set(linhas);
        this.carregandoNoShow.set(false);
        this.noShowCarregado = true;
      },
      error: (erro) => {
        this.erroNoShow.set(mensagemDeErro(erro, 'Não foi possível carregar a taxa de no-show por horário.'));
        this.carregandoNoShow.set(false);
      },
    });
  }

  /** "Terça 18:00" — dia da semana traduzido, junto do horário. */
  diaEHorario(linha: LinhaNoShowPorHorario): string {
    return `${ROTULO_DIA_SEMANA[linha.diaSemana]} ${linha.horario}`;
  }

  // ---------------------------------------------------------------
  // Horários de professor
  // ---------------------------------------------------------------

  private carregarSuporteDeHorarios(): void {
    this.usuarioService.listar(0, 200).subscribe({
      next: (pagina) => {
        const professores = pagina.content.filter((u) => u.tipoPerfil === 'PROFESSOR');
        this.professores.set(professores);
        if (professores.length > 0) {
          this.professorSelecionado.set(professores[0].id);
          this.listarHorarios();
        }
        this.horariosCarregados = true;
      },
      error: (erro) => this.erroHorarios.set(mensagemDeErro(erro, 'Não foi possível carregar os professores.')),
    });

    this.unidadeService.listar().subscribe({
      next: (unidades) => {
        this.unidades.set(unidades);
        if (unidades.length === 1) this.formHorario.patchValue({ unidadeId: unidades[0].id });
      },
      error: () => {},
    });
  }

  aoTrocarProfessor(professorId: number): void {
    this.professorSelecionado.set(professorId);
    this.listarHorarios();
  }

  listarHorarios(): void {
    const professorId = this.professorSelecionado();
    if (!professorId) return;

    this.carregandoHorarios.set(true);
    this.erroHorarios.set(null);

    this.agendaService.horariosDoProfessor(professorId).subscribe({
      next: (horarios) => {
        this.horarios.set(horarios);
        this.carregandoHorarios.set(false);
      },
      error: (erro) => {
        this.erroHorarios.set(mensagemDeErro(erro, 'Não foi possível carregar os horários.'));
        this.carregandoHorarios.set(false);
      },
    });
  }

  adicionarHorario(): void {
    const professorId = this.professorSelecionado();
    if (!professorId || this.formHorario.invalid) {
      this.formHorario.markAllAsTouched();
      return;
    }

    const valores = this.formHorario.getRawValue();
    this.agendaService
      .criarHorario(professorId, {
        diaSemana: valores.diaSemana,
        horaInicio: valores.horaInicio,
        horaFim: valores.horaFim,
        unidadeId: valores.unidadeId!,
      })
      .subscribe({
        next: () => {
          this.snackBar.open('Horário adicionado.', 'Fechar', { duration: 4000 });
          this.listarHorarios();
        },
        error: (erro) => this.snackBar.open(mensagemDeErro(erro), 'Fechar', { duration: 6000 }),
      });
  }

  rotuloDoDia(dia: HorarioProfessor['diaSemana']): string {
    return this.rotuloDia[dia];
  }

  removerHorario(horario: HorarioProfessor): void {
    const professorId = this.professorSelecionado();
    if (!professorId) return;
    if (!confirm(`Remover o horário de ${this.rotuloDia[horario.diaSemana]} `
      + `${horario.horaInicio.slice(0, 5)}–${horario.horaFim.slice(0, 5)}?`)) {
      return;
    }

    this.agendaService.removerHorario(professorId, horario.id).subscribe({
      next: () => {
        this.snackBar.open('Horário removido.', 'Fechar', { duration: 4000 });
        this.listarHorarios();
      },
      error: (erro) => this.snackBar.open(mensagemDeErro(erro), 'Fechar', { duration: 6000 }),
    });
  }

  // ---------------------------------------------------------------
  private formatarDataHora(iso: string): string {
    const data = new Date(iso);
    return data.toLocaleString('pt-BR', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' });
  }
}
