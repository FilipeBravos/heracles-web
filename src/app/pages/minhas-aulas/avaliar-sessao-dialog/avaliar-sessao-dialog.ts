import { Component, inject, signal } from '@angular/core';
import { DatePipe } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSelectModule } from '@angular/material/select';

import { AgendamentoPersonal } from '../../../core/models';
import { MinhasAulasService } from '../../../core/services/agenda.service';
import { mensagemDeErro } from '../../../core/services/erro-api';

export interface AvaliarSessaoDialogData {
  sessao: AgendamentoPersonal;
}

/**
 * A avaliação da sessão de personal já realizada — a mesma pergunta que
 * o motivo de cancelamento faz de outro jeito, mas aqui o aluno ainda
 * está engajado, então a taxa de resposta tende a ser melhor.
 */
@Component({
  selector: 'app-avaliar-sessao-dialog',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatSelectModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    DatePipe,
  ],
  templateUrl: './avaliar-sessao-dialog.html',
})
export class AvaliarSessaoDialogComponent {
  private readonly fb = inject(FormBuilder);
  private readonly minhasAulasService = inject(MinhasAulasService);

  readonly dialogRef = inject(MatDialogRef<AvaliarSessaoDialogComponent>);
  readonly data = inject<AvaliarSessaoDialogData>(MAT_DIALOG_DATA);

  readonly sessao = this.data.sessao;
  readonly notas = [
    { valor: 5, rotulo: '5 — Excelente' },
    { valor: 4, rotulo: '4 — Boa' },
    { valor: 3, rotulo: '3 — Regular' },
    { valor: 2, rotulo: '2 — Ruim' },
    { valor: 1, rotulo: '1 — Muito ruim' },
  ];

  readonly enviando = signal(false);
  readonly erro = signal<string | null>(null);

  readonly form = this.fb.nonNullable.group({
    nota: [null as number | null, Validators.required],
    comentario: ['', Validators.maxLength(500)],
  });

  avaliar(): void {
    if (this.form.invalid || this.enviando()) {
      this.form.markAllAsTouched();
      return;
    }

    this.enviando.set(true);
    this.erro.set(null);

    const { nota, comentario } = this.form.getRawValue();

    this.minhasAulasService.avaliarSessaoPersonal(this.sessao.id, { nota: nota!, comentario: comentario || null })
      .subscribe({
        next: (avaliada) => this.dialogRef.close(avaliada),
        error: (erro) => {
          this.enviando.set(false);
          this.erro.set(mensagemDeErro(erro, 'Não foi possível enviar a avaliação.'));
        },
      });
  }
}
