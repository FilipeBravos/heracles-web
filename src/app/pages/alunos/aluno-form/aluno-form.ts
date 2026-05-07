import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import {
  MatDialogRef,
  MatDialogModule,
  MAT_DIALOG_DATA,
} from '@angular/material/dialog';
import { HttpClient } from '@angular/common/http';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatOption, MatSelectModule } from '@angular/material/select';

@Component({
  selector: 'app-aluno-form',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatSelectModule,
    MatInputModule,
    MatButtonModule,
    MatOption,
  ],
  templateUrl: './aluno-form.html',
})
export class AlunoForm {
  private fb = inject(FormBuilder);
  private http = inject(HttpClient);
  public dialogRef = inject(MatDialogRef<AlunoForm>);
  public data = inject(MAT_DIALOG_DATA, { optional: true });

  isEditMode = false;

  // Estrutura do Aluno baseada no seu PostgreSQL
  alunoForm = this.fb.group({
    nome: this.fb.control('', {
      nonNullable: true,
      validators: [Validators.required],
    }),
    cpf: this.fb.control('', {
      nonNullable: true,
      validators: [Validators.required],
    }),
    email: this.fb.control('', {
      nonNullable: true,
      validators: [Validators.required, Validators.email],
    }),
    telefone: this.fb.control('', {
      nonNullable: true,
      validators: [Validators.required],
    }),
    status: this.fb.control('ATIVO'), // Valor padrão oculto
    tipoPerfil: this.fb.control('ALUNO'), // Valor padrão oculto
    senhaHash: this.fb.control('123456'), // Senha padrão inicial para o MVP
  });

  ngOnInit() {
    // Se recebeu dados, significa que clicamos no botão de Editar!
    if (this.data && this.data.aluno) {
      this.isEditMode = true;
      // O patchValue preenche os campos do formulário automaticamente
      this.alunoForm.patchValue(this.data.aluno);
    }
  }

  salvar() {
    const formValue = this.alunoForm.value;

    if (this.alunoForm.valid && formValue) {
      const dadosParaEnviar = {
        nome: formValue.nome,
        email: formValue.email,
        telefone: formValue.telefone,
        cpf: (formValue.cpf ?? '').replace(/\D/g, ''),
        tipoPerfil: formValue.tipoPerfil || 'ALUNO',
        senha: formValue.senhaHash,
      };

      if (this.isEditMode) {
        const id = this.data.aluno.id;

        const payloadAtualizacao = {
          ...dadosParaEnviar,
          id: id,
        };
        this.http
          .put(`http://localhost:8080/api/usuarios/${id}`, payloadAtualizacao)
          .subscribe({
            next: () => this.dialogRef.close(true),
            error: (err) => console.error('Erro ao atualizar aluno', err),
          });
      } else {
        this.http
          .post('http://localhost:8080/api/usuarios', dadosParaEnviar)
          .subscribe({
            next: () => this.dialogRef.close(true),
            error: (err) => console.error('Erro ao criar aluno', err),
          });
      }
    }
  }
}
