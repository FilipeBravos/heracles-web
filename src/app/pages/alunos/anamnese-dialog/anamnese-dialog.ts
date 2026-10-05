import { Component, OnInit, inject, signal } from '@angular/core';
import { DatePipe } from '@angular/common';
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

export interface AnamneseDialogData {
  aluno: Usuario;
}

/**
 * Formulário estruturado, não uma caixa de texto livre: cada resposta é um
 * campo próprio para a equipe conseguir ler rápido no dia a dia, e para
 * "condições de saúde" em branco ficar distinto de "ainda não perguntamos".
 */
@Component({
  selector: 'app-anamnese-dialog',
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
  templateUrl: './anamnese-dialog.html',
})
export class AnamneseDialogComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly usuarioService = inject(UsuarioService);

  readonly dialogRef = inject(MatDialogRef<AnamneseDialogComponent>);
  readonly data = inject<AnamneseDialogData>(MAT_DIALOG_DATA);

  readonly carregando = signal(true);
  readonly enviando = signal(false);
  readonly erro = signal<string | null>(null);
  readonly preenchidaEm = signal<string | null>(null);

  readonly form = this.fb.nonNullable.group({
    objetivo: ['', [Validators.required, Validators.maxLength(500)]],
    condicoesSaude: [''],
    lesoesCirurgias: [''],
    medicamentosUso: [''],
    restricoesMedicas: [''],
    contatoEmergenciaNome: ['', [Validators.required, Validators.maxLength(100)]],
    contatoEmergenciaTelefone: ['', [Validators.required, Validators.maxLength(20)]],
  });

  ngOnInit(): void {
    this.usuarioService.buscarAnamnese(this.data.aluno.id).subscribe({
      next: (anamnese) => {
        if (anamnese.preenchida) {
          this.form.patchValue({
            objetivo: anamnese.objetivo ?? '',
            condicoesSaude: anamnese.condicoesSaude ?? '',
            lesoesCirurgias: anamnese.lesoesCirurgias ?? '',
            medicamentosUso: anamnese.medicamentosUso ?? '',
            restricoesMedicas: anamnese.restricoesMedicas ?? '',
            contatoEmergenciaNome: anamnese.contatoEmergenciaNome ?? '',
            contatoEmergenciaTelefone: anamnese.contatoEmergenciaTelefone ?? '',
          });
          this.preenchidaEm.set(anamnese.preenchidaEm);
        }
        this.carregando.set(false);
      },
      error: (erro) => {
        this.erro.set(mensagemDeErro(erro, 'Não foi possível carregar a anamnese.'));
        this.carregando.set(false);
      },
    });
  }

  salvar(): void {
    if (this.form.invalid || this.enviando()) {
      this.form.markAllAsTouched();
      return;
    }

    this.enviando.set(true);
    this.erro.set(null);

    const valores = this.form.getRawValue();
    this.usuarioService
      .salvarAnamnese(this.data.aluno.id, {
        objetivo: valores.objetivo,
        condicoesSaude: valores.condicoesSaude.trim() || null,
        lesoesCirurgias: valores.lesoesCirurgias.trim() || null,
        medicamentosUso: valores.medicamentosUso.trim() || null,
        restricoesMedicas: valores.restricoesMedicas.trim() || null,
        contatoEmergenciaNome: valores.contatoEmergenciaNome,
        contatoEmergenciaTelefone: valores.contatoEmergenciaTelefone,
      })
      .subscribe({
        next: () => this.dialogRef.close(true),
        error: (erro) => {
          this.enviando.set(false);
          this.erro.set(mensagemDeErro(erro, 'Não foi possível salvar a anamnese.'));
        },
      });
  }
}
