import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSelectModule } from '@angular/material/select';

import { Unidade } from '../../../core/models';
import { UnidadeService } from '../../../core/services/unidade.service';
import { mensagemDeErro } from '../../../core/services/erro-api';

export interface UnidadeFormData {
  unidade: Unidade | null;
}

@Component({
  selector: 'app-unidade-form',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
  ],
  templateUrl: './unidade-form.html',
})
export class UnidadeFormComponent {
  private readonly fb = inject(FormBuilder);
  private readonly unidadeService = inject(UnidadeService);

  readonly dialogRef = inject(MatDialogRef<UnidadeFormComponent>);
  readonly data = inject<UnidadeFormData>(MAT_DIALOG_DATA);

  readonly unidade = this.data?.unidade ?? null;
  readonly isEditMode = this.unidade !== null;
  readonly enviando = signal(false);
  readonly erro = signal<string | null>(null);

  readonly form = this.fb.nonNullable.group({
    nome: [this.unidade?.nome ?? '', [Validators.required, Validators.maxLength(100)]],
    tipo: [this.unidade?.tipo ?? 'ACADEMIA', Validators.required],
    endereco: [this.unidade?.endereco ?? ''],
    telefone: [this.unidade?.telefone ?? ''],
  });

  salvar(): void {
    if (this.form.invalid || this.enviando()) {
      this.form.markAllAsTouched();
      return;
    }

    this.enviando.set(true);
    this.erro.set(null);

    const valores = this.form.getRawValue();
    const payload = {
      nome: valores.nome.trim(),
      tipo: valores.tipo,
      endereco: valores.endereco.trim() || null,
      telefone: valores.telefone.trim() || null,
    };

    const requisicao = this.unidade
      ? this.unidadeService.atualizar(this.unidade.id, payload)
      : this.unidadeService.criar(payload);

    requisicao.subscribe({
      next: () => this.dialogRef.close(true),
      error: (erro) => {
        this.enviando.set(false);
        this.erro.set(mensagemDeErro(erro, 'Não foi possível salvar a unidade.'));
      },
    });
  }
}
