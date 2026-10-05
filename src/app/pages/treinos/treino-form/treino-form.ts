import { Component, inject, signal } from '@angular/core';
import {
  AbstractControl,
  FormArray,
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  ValidationErrors,
  Validators,
} from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatDividerModule } from '@angular/material/divider';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSelectModule } from '@angular/material/select';

import { ExercicioForm, Treino } from '../../../core/models';

/**
 * Espelha a validação `faixaDeRepeticoesCoerente` do DTO na API, para que o
 * erro apareça enquanto se digita em vez de só voltar do servidor.
 */
function faixaDeRepeticoesCoerente(grupo: AbstractControl): ValidationErrors | null {
  const min = grupo.get('repeticoesMin')?.value;
  const max = grupo.get('repeticoesMax')?.value;

  if (min == null || max == null || min === '' || max === '') {
    return null; // quem reporta ausência é o Validators.required
  }
  return Number(max) >= Number(min) ? null : { faixaInvertida: true };
}
import { TreinoService } from '../../../core/services/treino.service';
import { mensagemDeErro } from '../../../core/services/erro-api';

export interface TreinoFormData {
  treino: Treino | null;
}

@Component({
  selector: 'app-treino-form',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatSelectModule,
    MatDividerModule,
    MatIconModule,
    MatProgressSpinnerModule,
  ],
  templateUrl: './treino-form.html',
})
export class TreinoFormComponent {
  private readonly fb = inject(FormBuilder);
  private readonly treinoService = inject(TreinoService);

  readonly dialogRef = inject(MatDialogRef<TreinoFormComponent>);
  readonly data = inject<TreinoFormData>(MAT_DIALOG_DATA);

  readonly treino = this.data?.treino ?? null;
  readonly isEditMode = this.treino !== null;
  readonly enviando = signal(false);
  readonly erro = signal<string | null>(null);

  readonly form = this.fb.nonNullable.group({
    nome: [this.treino?.nome ?? '', [Validators.required, Validators.maxLength(100)]],
    foco: [this.treino?.foco ?? '', Validators.required],
    nivel: [this.treino?.nivel ?? '', Validators.required],
    exercicios: this.fb.array<FormGroup>([]),
  });

  constructor() {
    if (this.treino && this.treino.exercicios.length > 0) {
      // A API devolve os exercícios já ordenados por "ordem".
      this.treino.exercicios.forEach((exercicio) =>
        this.exercicios.push(this.novoExercicio(exercicio))
      );
    } else {
      this.adicionarExercicio();
    }
  }

  get exercicios(): FormArray<FormGroup> {
    return this.form.controls.exercicios;
  }

  private novoExercicio(exercicio?: Partial<ExercicioForm>): FormGroup {
    return this.fb.group(
      {
        // O id viaja de volta para a API, que reconcilia por ele em vez de
        // apagar e recriar a lista inteira a cada edição.
        id: [exercicio?.id ?? null],
        nome: [exercicio?.nome ?? '', [Validators.required, Validators.maxLength(100)]],
        series: [
          exercicio?.series ?? 3,
          [Validators.required, Validators.min(1), Validators.max(20)],
        ],
        repeticoesMin: [
          exercicio?.repeticoesMin ?? 10,
          [Validators.required, Validators.min(1), Validators.max(500)],
        ],
        repeticoesMax: [
          exercicio?.repeticoesMax ?? 10,
          [Validators.required, Validators.min(1), Validators.max(500)],
        ],
        carga: [exercicio?.carga ?? ''],
        observacoes: [exercicio?.observacoes ?? ''],
      },
      { validators: faixaDeRepeticoesCoerente }
    );
  }

  adicionarExercicio(): void {
    this.exercicios.push(this.novoExercicio());
  }

  removerExercicio(indice: number): void {
    this.exercicios.removeAt(indice);
  }

  salvar(): void {
    if (this.form.invalid || this.exercicios.length === 0 || this.enviando()) {
      this.form.markAllAsTouched();
      return;
    }

    this.enviando.set(true);
    this.erro.set(null);

    const valores = this.form.getRawValue();
    const payload = {
      nome: valores.nome,
      foco: valores.foco,
      nivel: valores.nivel,
      exercicios: this.exercicios.controls.map((controle) => {
        const exercicio = controle.getRawValue() as ExercicioForm;
        return {
          id: exercicio.id ?? null,
          nome: exercicio.nome,
          series: Number(exercicio.series),
          repeticoesMin: Number(exercicio.repeticoesMin),
          repeticoesMax: Number(exercicio.repeticoesMax),
          carga: exercicio.carga?.trim() || null,
          observacoes: exercicio.observacoes?.trim() || null,
        };
      }),
    };

    const requisicao = this.treino
      ? this.treinoService.atualizar(this.treino.id, payload)
      : this.treinoService.criar(payload);

    requisicao.subscribe({
      next: () => this.dialogRef.close(true),
      error: (erro) => {
        this.enviando.set(false);
        this.erro.set(mensagemDeErro(erro, 'Não foi possível salvar a ficha.'));
      },
    });
  }
}
