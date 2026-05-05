import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators, FormArray, FormGroup } from '@angular/forms';
import { MatDialogRef, MatDialogModule, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { HttpClient } from '@angular/common/http';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatSelectModule } from '@angular/material/select';
import { MatDivider } from "@angular/material/divider";
import { MatIcon } from "@angular/material/icon";

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
    MatIcon
],
  templateUrl: './treino-form.html'
})
export class TreinoFormComponent {
  private fb = inject(FormBuilder);
  private http = inject(HttpClient);
  public dialogRef = inject(MatDialogRef<TreinoFormComponent>); // Controla o modal aberto

  public data = inject(MAT_DIALOG_DATA, { optional: true });
  isEditMode = false;

  // Construindo o Formulário Reativo com as validações
treinoForm = this.fb.group({
    nome: ['', Validators.required],
    foco: ['', Validators.required],
    nivel: ['', Validators.required],
    exercicios: this.fb.array([]) 
  });

  get exercicios() {
    return this.treinoForm.get('exercicios') as FormArray;
  }

  novoExercicio(): FormGroup {
    return this.fb.group({
      id: [null], 
      nome: ['', Validators.required],
      repeticoes: ['', Validators.required],
      observacoes: ['']
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
      
      // Preenche dados básicos
      this.treinoForm.patchValue({
        nome: this.data.treino.nome,
        foco: this.data.treino.foco,
        nivel: this.data.treino.nivel
      });

      // Se já existem exercícios no banco, cria os campinhos e preenche
      if (this.data.treino.exercicios && this.data.treino.exercicios.length > 0) {
        this.data.treino.exercicios.forEach((ex: any) => {
          const formEx = this.novoExercicio();
          formEx.patchValue(ex);
          this.exercicios.push(formEx);
        });
      }
    } else {
      // Se for criar um treino novo, já deixa 1 linha de exercício em branco para facilitar
      this.adicionarExercicio();
    }
  }

salvar() {
    if (this.treinoForm.valid) {
      const url = 'http://localhost:8080/api/treinos';
      const request = this.isEditMode 
        ? this.http.put(`${url}/${this.data.treino.id}`, this.treinoForm.value)
        : this.http.post(url, this.treinoForm.value);

      request.subscribe({
        next: () => this.dialogRef.close(true),
        error: (err) => console.error('Erro ao salvar', err)
      });
    }
  }
}
