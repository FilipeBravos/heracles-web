import { Component, OnInit, inject, signal } from '@angular/core';
import { DatePipe } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

import { ExecucaoExercicio } from '../../../core/models';
import { MinhaAreaService } from '../../../core/services/minha-area.service';
import { mensagemDeErro } from '../../../core/services/erro-api';

export interface RegistroExecucaoDialogData {
  exercicioId: number;
  exercicioNome: string;
}

/**
 * Registra o que o aluno de fato executou de um exercício da própria
 * ficha, e mostra a evolução — carga registrada nas vezes anteriores —
 * ao lado, para comparar sem sair do diálogo.
 */
@Component({
  selector: 'app-registro-execucao-dialog',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    DatePipe,
  ],
  templateUrl: './registro-execucao-dialog.html',
})
export class RegistroExecucaoDialogComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly minhaArea = inject(MinhaAreaService);

  readonly dialogRef = inject(MatDialogRef<RegistroExecucaoDialogComponent>);
  readonly data = inject<RegistroExecucaoDialogData>(MAT_DIALOG_DATA);

  readonly enviando = signal(false);
  readonly erro = signal<string | null>(null);

  readonly carregandoHistorico = signal(true);
  readonly historico = signal<ExecucaoExercicio[]>([]);

  readonly form = this.fb.nonNullable.group({
    dataExecucao: [this.hoje(), Validators.required],
    seriesRealizadas: [null as number | null, [Validators.required, Validators.min(1), Validators.max(50)]],
    repeticoesRealizadas: [null as number | null, [Validators.required, Validators.min(1), Validators.max(500)]],
    cargaRealizada: [null as number | null, [Validators.min(0)]],
    observacao: [''],
  });

  ngOnInit(): void {
    this.minhaArea.execucoesDoExercicio(this.data.exercicioId).subscribe({
      next: (historico) => {
        this.historico.set(historico);
        this.carregandoHistorico.set(false);
      },
      error: () => {
        // Falha ao carregar a evolução não impede registrar uma nova execução.
        this.carregandoHistorico.set(false);
      },
    });
  }

  registrar(): void {
    if (this.form.invalid || this.enviando()) {
      this.form.markAllAsTouched();
      return;
    }

    this.enviando.set(true);
    this.erro.set(null);

    const valores = this.form.getRawValue();
    this.minhaArea
      .registrarExecucao({
        exercicioId: this.data.exercicioId,
        dataExecucao: valores.dataExecucao,
        seriesRealizadas: Number(valores.seriesRealizadas),
        repeticoesRealizadas: Number(valores.repeticoesRealizadas),
        cargaRealizada: valores.cargaRealizada != null ? Number(valores.cargaRealizada) : null,
        observacao: valores.observacao.trim() || null,
      })
      .subscribe({
        next: () => this.dialogRef.close(true),
        error: (erro) => {
          this.enviando.set(false);
          this.erro.set(mensagemDeErro(erro, 'Não foi possível registrar a execução.'));
        },
      });
  }

  private hoje(): string {
    return new Date().toISOString().slice(0, 10);
  }
}
