import { Component, OnInit, inject, signal } from '@angular/core';
import { DatePipe } from '@angular/common';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

import { AulaGrupo, LinhaPresenca } from '../../../core/models';
import { AgendaService } from '../../../core/services/agenda.service';
import { mensagemDeErro } from '../../../core/services/erro-api';

export interface PresencaDialogData {
  aula: AulaGrupo;
}

/**
 * O professor confirma quem compareceu, aluno a aluno — sem formulário,
 * cada clique já grava a presença ou a falta. Como a presença não muda a
 * ocupação da turma, fechar o diálogo não precisa recarregar a agenda.
 */
@Component({
  selector: 'app-presenca-dialog',
  standalone: true,
  imports: [MatDialogModule, MatButtonModule, MatIconModule, MatProgressSpinnerModule, DatePipe],
  templateUrl: './presenca-dialog.html',
})
export class PresencaDialogComponent implements OnInit {
  private readonly agendaService = inject(AgendaService);

  readonly dialogRef = inject(MatDialogRef<PresencaDialogComponent>);
  readonly data = inject<PresencaDialogData>(MAT_DIALOG_DATA);

  readonly aula = this.data.aula;
  readonly carregando = signal(true);
  readonly erro = signal<string | null>(null);
  readonly roster = signal<LinhaPresenca[]>([]);
  /** Aluno cuja confirmação está em andamento — evita duplo clique. */
  readonly confirmando = signal<number | null>(null);

  ngOnInit(): void {
    this.carregar();
  }

  carregar(): void {
    this.carregando.set(true);
    this.erro.set(null);

    this.agendaService.inscricoesDaAula(this.aula.id).subscribe({
      next: (roster) => {
        this.roster.set(roster);
        this.carregando.set(false);
      },
      error: (erro) => {
        this.erro.set(mensagemDeErro(erro, 'Não foi possível carregar a lista de alunos.'));
        this.carregando.set(false);
      },
    });
  }

  confirmar(aluno: LinhaPresenca, presente: boolean): void {
    this.confirmando.set(aluno.alunoId);
    this.erro.set(null);

    this.agendaService.confirmarPresenca(this.aula.id, aluno.alunoId, presente).subscribe({
      next: () => {
        this.roster.update((lista) =>
          lista.map((l) => (l.alunoId === aluno.alunoId ? { ...l, presente } : l))
        );
        this.confirmando.set(null);
      },
      error: (erro) => {
        this.erro.set(mensagemDeErro(erro, 'Não foi possível confirmar a presença.'));
        this.confirmando.set(null);
      },
    });
  }
}
