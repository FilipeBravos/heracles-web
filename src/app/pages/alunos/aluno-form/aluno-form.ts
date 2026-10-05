import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { MatDialogRef, MatDialogModule, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { HttpClient } from '@angular/common/http';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatOption, MatSelectModule } from '@angular/material/select';

@Component({
  selector: 'app-aluno-form',
  standalone: true,
  imports: [
    CommonModule, ReactiveFormsModule, MatDialogModule, MatFormFieldModule,
    MatSelectModule, MatInputModule, MatButtonModule, MatOption,
  ],
  templateUrl: './aluno-form.html',
})
export class AlunoForm implements OnInit {
  private fb = inject(FormBuilder);
  private http = inject(HttpClient);
  public dialogRef = inject(MatDialogRef<AlunoForm>);
  public data = inject(MAT_DIALOG_DATA, { optional: true });

  isEditMode = false;

  // 🌟 Formulário blindado com as exatas colunas da tabela core.alunos
  alunoForm = this.fb.group({
    nome: this.fb.control('', { validators: [Validators.required] }),
    cpf: this.fb.control('', { validators: [Validators.required] }),
    email: this.fb.control('', { validators: [Validators.required, Validators.email] }),
    telefone: this.fb.control('', { validators: [Validators.required] }),
    dataNascimento: this.fb.control('', { validators: [Validators.required] }), // Para o % de Gordura
    sexo: this.fb.control('', { validators: [Validators.required] }), // Para o % de Gordura
    unidadeId: this.fb.control<number | null>(null, { validators: [Validators.required] }) // Filial
  });

  ngOnInit() {
    if (this.data && this.data.aluno) {
      this.isEditMode = true;
      this.alunoForm.patchValue(this.data.aluno);
    }
  }

  salvar() {
    if (this.alunoForm.valid) {
      const formValue = this.alunoForm.value;

      // 🌟 Monta o Payload DTO exatamente como o Spring Boot espera
      const dadosParaEnviar = {
        nome: formValue.nome,
        email: formValue.email,
        telefone: formValue.telefone,
        cpf: (formValue.cpf ?? '').replace(/\D/g, ''),
        dataNascimento: formValue.dataNascimento,
        sexo: formValue.sexo,
        unidadeId: formValue.unidadeId
      };

      // 🌟 Aponta para a Controller exclusiva de Alunos
      const url = 'http://localhost:8080/api/alunos';

      if (this.isEditMode) {
        // Envia o Put de atualização
        this.http.put(url, { ...dadosParaEnviar, id: this.data.aluno.id }).subscribe({
          next: () => this.dialogRef.close(true),
          error: (err) => console.error('Erro ao atualizar aluno', err),
        });
      } else {
        // Envia o Post de criação
        this.http.post(url, dadosParaEnviar).subscribe({
          next: () => this.dialogRef.close(true),
          error: (err) => console.error('Erro ao criar aluno', err),
        });
      }
    }
  }
}