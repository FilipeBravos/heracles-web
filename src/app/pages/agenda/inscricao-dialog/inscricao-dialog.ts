import { Component, OnInit, inject, signal } from '@angular/core';
import { DatePipe } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSelectModule } from '@angular/material/select';

import { AulaGrupo, Usuario } from '../../../core/models';
import { AgendaService } from '../../../core/services/agenda.service';
import { UsuarioService } from '../../../core/services/usuario.service';
import { mensagemDeErro } from '../../../core/services/erro-api';

export interface InscricaoDialogData {
  aula: AulaGrupo;
  /** Marcar reserva uma vaga em nome do aluno; desmarcar libera a dele. */
  modo: 'marcar' | 'desmarcar';
}

/**
 * Marca ou desmarca a vaga de um aluno em nome dele — o balcão, para quem
 * liga ou passa sem usar o app. O próprio aluno reserva pela área dele,
 * sem passar por este dialog.
 */
@Component({
  selector: 'app-inscricao-dialog',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatSelectModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    DatePipe,
  ],
  templateUrl: './inscricao-dialog.html',
})
export class InscricaoDialogComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly agendaService = inject(AgendaService);
  private readonly usuarioService = inject(UsuarioService);

  readonly dialogRef = inject(MatDialogRef<InscricaoDialogComponent>);
  readonly data = inject<InscricaoDialogData>(MAT_DIALOG_DATA);

  readonly carregando = signal(true);
  readonly enviando = signal(false);
  readonly erro = signal<string | null>(null);
  readonly alunos = signal<Usuario[]>([]);

  readonly form = this.fb.nonNullable.group({
    alunoId: [null as number | null, Validators.required],
  });

  ngOnInit(): void {
    this.usuarioService.listar(0, 200).subscribe({
      next: (pagina) => {
        this.alunos.set(pagina.content.filter((u) => u.tipoPerfil === 'ALUNO'));
        this.carregando.set(false);
      },
      error: (erro) => {
        this.erro.set(mensagemDeErro(erro, 'Não foi possível carregar os alunos.'));
        this.carregando.set(false);
      },
    });
  }

  confirmar(): void {
    if (this.form.invalid || this.enviando()) {
      this.form.markAllAsTouched();
      return;
    }

    this.enviando.set(true);
    this.erro.set(null);
    const alunoId = this.form.getRawValue().alunoId!;

    const requisicao = this.data.modo === 'marcar'
      ? this.agendaService.marcarVaga(this.data.aula.id, alunoId)
      : this.agendaService.desmarcarVaga(this.data.aula.id, alunoId);

    requisicao.subscribe({
      next: () => this.dialogRef.close(true),
      error: (erro) => {
        this.enviando.set(false);
        this.erro.set(mensagemDeErro(erro, this.data.modo === 'marcar'
          ? 'Não foi possível marcar a vaga.'
          : 'Não foi possível desmarcar a vaga.'));
      },
    });
  }
}
