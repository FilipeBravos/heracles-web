import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  ReactiveFormsModule,
  FormBuilder,
  Validators,
  FormArray,
  FormGroup,
} from '@angular/forms';
import {
  MatDialogRef,
  MatDialogModule,
  MAT_DIALOG_DATA,
} from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatSelectModule } from '@angular/material/select';
import { MatDivider } from '@angular/material/divider';
import { MatIcon } from '@angular/material/icon';

// 1. Importe o TreinoService e remova o HttpClient
import { TreinoService } from '../../../core/services/treino.service';

@Component({
  selector: 'app-treino-form',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatSelectModule,
    MatDivider,
    MatIcon,
  ],
  templateUrl: './treino-form.html',
})
export class TreinoFormComponent implements OnInit {
  private fb = inject(FormBuilder);

  // 2. Injete o serviço aqui
  private treinoService = inject(TreinoService);
  public dialogRef = inject(MatDialogRef<TreinoFormComponent>);
  public data = inject(MAT_DIALOG_DATA, { optional: true });

  isEditMode = false;

  treinoForm = this.fb.group({
    nome: ['', Validators.required],
    foco: ['', Validators.required],
    nivel: ['', Validators.required],
    exercicios: this.fb.array([]),
  });

  get exercicios() {
    return this.treinoForm.get('exercicios') as FormArray;
  }

  novoExercicio(): FormGroup {
    return this.fb.group({
      id: [null],
      nome: ['', Validators.required],
      repeticoes: ['', Validators.required],
      observacoes: [''],
    });
  }

  adicionarExercicio() {
    this.exercicios.push(this.novoExercicio());
  }

  removerExercicio(index: number) {
    this.exercicios.removeAt(index);
  }

  ngOnInit() {
    if (this.data && this.data.treino) {
      this.isEditMode = true;

  
      this.treinoForm.patchValue({
        nome: this.data.treino.nome,
        foco: this.data.treino.foco,
        nivel: this.data.treino.nivel,
      });

      if (
        this.data.treino.exercicios &&
        this.data.treino.exercicios.length > 0
      ) {
        this.data.treino.exercicios.forEach((ex: any) => {
          const formEx = this.novoExercicio();
          formEx.patchValue(ex);
          this.exercicios.push(formEx);
        });
      }
    } else {
      this.adicionarExercicio();
    }
  }

  salvar() {
    if (this.treinoForm.valid) {
      const dadosParaEnviar = this.treinoForm.value;

      if (this.isEditMode) {
        // 3. MODO EDIÇÃO: Injeta o ID no payload e chama o atualizar()
        const id = this.data.treino.id;
        const payloadAtualizacao = { ...dadosParaEnviar, id: id };

        this.treinoService.atualizar(id, payloadAtualizacao).subscribe({
          next: () => this.dialogRef.close(true),
          error: (err) => console.error('Erro ao atualizar treino', err),
        });
      } else {
        // 4. MODO CRIAÇÃO: Chama o cadastrar() direto
        this.treinoService.cadastrar(dadosParaEnviar).subscribe({
          next: () => this.dialogRef.close(true),
          error: (err) => console.error('Erro ao salvar treino', err),
        });
      }
    }
  }
}
