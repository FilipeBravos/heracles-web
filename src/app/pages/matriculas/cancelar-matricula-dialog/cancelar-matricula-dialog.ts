import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSelectModule } from '@angular/material/select';

import { Assinatura, MOTIVOS_CANCELAMENTO, MotivoCancelamento } from '../../../core/models';
import { AssinaturaService } from '../../../core/services/assinatura.service';
import { mensagemDeErro } from '../../../core/services/erro-api';

export interface CancelarMatriculaDialogData {
  assinatura: Assinatura;
}

/**
 * O motivo do cancelamento, perguntado no ato pela secretaria — é a
 * mesma pergunta que o balcão já faz de boca, só que agora vira dado: o
 * "porquê" por trás do churn que o painel de retenção mede em número.
 */
@Component({
  selector: 'app-cancelar-matricula-dialog',
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
  ],
  templateUrl: './cancelar-matricula-dialog.html',
})
export class CancelarMatriculaDialogComponent {
  private readonly fb = inject(FormBuilder);
  private readonly assinaturaService = inject(AssinaturaService);

  readonly dialogRef = inject(MatDialogRef<CancelarMatriculaDialogComponent>);
  readonly data = inject<CancelarMatriculaDialogData>(MAT_DIALOG_DATA);

  readonly assinatura = this.data.assinatura;
  readonly motivos = MOTIVOS_CANCELAMENTO;

  readonly enviando = signal(false);
  readonly erro = signal<string | null>(null);

  readonly form = this.fb.nonNullable.group({
    motivo: [null as MotivoCancelamento | null, Validators.required],
    comentario: ['', Validators.maxLength(500)],
  });

  cancelar(): void {
    if (this.form.invalid || this.enviando()) {
      this.form.markAllAsTouched();
      return;
    }

    this.enviando.set(true);
    this.erro.set(null);

    const { motivo, comentario } = this.form.getRawValue();

    this.assinaturaService.cancelar(this.assinatura.id, { motivo: motivo!, comentario: comentario || null })
      .subscribe({
        next: (cancelada) => this.dialogRef.close(cancelada),
        error: (erro) => {
          this.enviando.set(false);
          this.erro.set(mensagemDeErro(erro, 'Não foi possível cancelar a matrícula.'));
        },
      });
  }
}
