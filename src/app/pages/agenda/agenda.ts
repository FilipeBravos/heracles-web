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
  readonly colunasPersonal = ['aluno', 'professor', 'unidade', 'dataHora', 'observacoes', 'status', 'acoes'];
  readonly sessoesPersonal = signal<AgendamentoPersonal[]>([]);
  readonly carregandoPersonal = signal(false);
  readonly erroPersonal = signal<string | null>(null);
  readonly totalPersonal = signal(0);
  readonly paginaPersonal = signal(0);
  private personalCarregado = false;

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
      .subscribe((confirmou) => {
        if (confirmou) {
          this.snackBar.open('Vaga marcada.', 'Fechar', { duration: 4000 });
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
