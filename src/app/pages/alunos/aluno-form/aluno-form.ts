import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { MatDialogRef, MatDialogModule, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { HttpClient } from '@angular/common/http';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'app-aluno-form',
  standalone: true,
  imports: [
    CommonModule, 
    ReactiveFormsModule, 
    MatDialogModule, 
    MatFormFieldModule, 
    MatInputModule, 
    MatButtonModule
  ],
  templateUrl: './aluno-form.html'
})
export class AlunoForm {
  private fb = inject(FormBuilder);
  private http = inject(HttpClient);
  public dialogRef = inject(MatDialogRef<AlunoForm>);
  public data = inject(MAT_DIALOG_DATA, { optional: true }); 

  isEditMode = false;

  // Estrutura do Aluno baseada no seu PostgreSQL
  alunoForm = this.fb.group({
    nome: ['', Validators.required],
    cpf: ['', Validators.required],
    email: ['', [Validators.required, Validators.email]],
    telefone: ['', Validators.required],
    status: ['ATIVO'],       // Valor padrão oculto
    tipoPerfil: ['ALUNO'],   // Valor padrão oculto
    senhaHash: ['123456']    // Senha padrão inicial para o MVP
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
    if (this.alunoForm.valid) {
      if (this.isEditMode) {
        // MODO EDIÇÃO: Dispara PUT para a rota com ID
        const id = this.data.aluno.id;
        this.http.put(`http://localhost:8080/api/usuarios/${id}`, this.alunoForm.value)
          .subscribe({
            next: () => this.dialogRef.close(true),
            error: (err) => console.error('Erro ao atualizar aluno', err)
          });
      } else {
        // MODO CRIAÇÃO: Dispara POST normal
        this.http.post('http://localhost:8080/api/usuarios', this.alunoForm.value)
          .subscribe({
            next: () => this.dialogRef.close(true),
            error: (err) => console.error('Erro ao criar aluno', err)
          });
      }
    }
  }
}