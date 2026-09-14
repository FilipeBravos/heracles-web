import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

import { Usuario } from '../../../core/models';
import { UsuarioService } from '../../../core/services/usuario.service';
import { mensagemDeErro } from '../../../core/services/erro-api';

export interface AlunoFormData {
  aluno: Usuario | null;
}

@Component({
  selector: 'app-aluno-form',
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
  templateUrl: './aluno-form.html',
})
export class AlunoFormComponent {
  private readonly fb = inject(FormBuilder);
  private readonly usuarioService = inject(UsuarioService);

  readonly dialogRef = inject(MatDialogRef<AlunoFormComponent>);
  readonly data = inject<AlunoFormData>(MAT_DIALOG_DATA);

  readonly aluno = this.data?.aluno ?? null;
  readonly isEditMode = this.aluno !== null;
  readonly enviando = signal(false);
  readonly erro = signal<string | null>(null);

  readonly form = this.fb.nonNullable.group({
    nome: [this.aluno?.nome ?? '', [Validators.required, Validators.maxLength(100)]],
    cpf: [this.aluno?.cpf ?? '', [Validators.required, Validators.pattern(/^\d{3}\.?\d{3}\.?\d{3}-?\d{2}$/)]],
    email: [this.aluno?.email ?? '', [Validators.required, Validators.email]],
    telefone: [this.aluno?.telefone ?? ''],
    // Só no cadastro. A senha é enviada em claro sobre HTTPS e cifrada com
    // BCrypt no servidor — o formulário não monta mais nenhum hash.
    senha: ['', this.aluno ? [] : [Validators.required, Validators.minLength(8)]],
  });

  salvar(): void {
    if (this.form.invalid || this.enviando()) {
      this.form.markAllAsTouched();
      return;
    }

    this.enviando.set(true);
    this.erro.set(null);

    const valores = this.form.getRawValue();
    const telefone = valores.telefone.trim() || null;

    const requisicao = this.aluno
      ? this.usuarioService.atualizar(this.aluno.id, {
          nome: valores.nome,
          cpf: valores.cpf,
          email: valores.email,
          telefone,
        })
      : this.usuarioService.criar({
          nome: valores.nome,
          cpf: valores.cpf,
          email: valores.email,
          telefone,
          // O perfil é fixo no cliente, mas quem decide de verdade é a API:
          // só ADMIN e SECRETARIA conseguem chamar esta rota.
          tipoPerfil: 'ALUNO',
          senha: valores.senha,
        });

    requisicao.subscribe({
      next: () => this.dialogRef.close(true),
      error: (erro) => {
        this.enviando.set(false);
        this.erro.set(mensagemDeErro(erro, 'Não foi possível salvar o aluno.'));
      },
    });
  }
}
