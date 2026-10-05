import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

import { ChamadoManutencao, Equipamento } from '../../../core/models';
import { EquipamentoService } from '../../../core/services/equipamento.service';
import { mensagemDeErro } from '../../../core/services/erro-api';

export interface ChamadoDialogData {
  equipamento: Equipamento;
  /** Nulo = abrir chamado; preenchido = resolver o chamado existente. */
  chamado: ChamadoManutencao | null;
}

/**
 * Um diálogo para as duas pontas do ciclo de manutenção.
 *
 * Abrir e resolver compartilham o contexto (qual aparelho, qual problema),
 * e separá-los em duas telas faria o operador reler a descrição noutro
 * lugar para saber o que está fechando.
 */
@Component({
  selector: 'app-chamado-dialog',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
  ],
  templateUrl: './chamado-dialog.html',
})
export class ChamadoDialogComponent {
  private readonly fb = inject(FormBuilder);
  private readonly equipamentoService = inject(EquipamentoService);

  readonly dialogRef = inject(MatDialogRef<ChamadoDialogComponent>);
  readonly data = inject<ChamadoDialogData>(MAT_DIALOG_DATA);

  readonly equipamento = this.data.equipamento;
  readonly chamado = this.data.chamado;
  readonly resolvendo = this.chamado !== null;

  readonly enviando = signal(false);
  readonly erro = signal<string | null>(null);

  readonly formAbertura = this.fb.nonNullable.group({
    descricaoProblema: ['', [Validators.required, Validators.maxLength(2000)]],
  });

  readonly formResolucao = this.fb.nonNullable.group({
    // Opcional: nem todo reparo tem custo (garantia, ajuste interno).
    custoReparo: [null as number | null, [Validators.min(0)]],
  });

  confirmar(): void {
    if (this.enviando()) return;

    const form = this.resolvendo ? this.formResolucao : this.formAbertura;
    if (form.invalid) {
      form.markAllAsTouched();
      return;
    }

    this.enviando.set(true);
    this.erro.set(null);

    const requisicao = this.resolvendo
      ? this.equipamentoService.resolverChamado(
          this.chamado!.id,
          this.formResolucao.getRawValue().custoReparo
        )
      : this.equipamentoService.abrirChamado(
          this.equipamento.id,
          this.formAbertura.getRawValue().descricaoProblema.trim()
        );

    requisicao.subscribe({
      next: () => this.dialogRef.close(true),
      error: (erro) => {
        this.enviando.set(false);
        this.erro.set(
          mensagemDeErro(erro, this.resolvendo
            ? 'Não foi possível resolver o chamado.'
            : 'Não foi possível abrir o chamado.')
        );
      },
    });
  }
}
