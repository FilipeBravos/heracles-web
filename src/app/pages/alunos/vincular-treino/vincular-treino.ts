import { Component, OnInit, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSelectModule } from '@angular/material/select';

import { Treino, Usuario } from '../../../core/models';
import { TreinoService } from '../../../core/services/treino.service';
import { UsuarioService } from '../../../core/services/usuario.service';
import { mensagemDeErro } from '../../../core/services/erro-api';

export interface VincularTreinoData {
  aluno: Usuario;
}

@Component({
  selector: 'app-vincular-treino',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatSelectModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
  ],
  templateUrl: './vincular-treino.html',
})
export class VincularTreinoComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly treinoService = inject(TreinoService);
  private readonly usuarioService = inject(UsuarioService);

  readonly dialogRef = inject(MatDialogRef<VincularTreinoComponent>);
  readonly data = inject<VincularTreinoData>(MAT_DIALOG_DATA);

  readonly treinosDisponiveis = signal<Treino[]>([]);
  readonly carregando = signal(true);
  readonly enviando = signal(false);
  readonly erro = signal<string | null>(null);

  // Sem required: lista vazia é uma escolha válida, significa desvincular tudo.
  readonly form = this.fb.nonNullable.group({
    treinosIds: [[] as number[]],
  });

  ngOnInit(): void {
    // Tamanho generoso: o seletor precisa de todas as fichas, não de uma página.
    this.treinoService.listar(0, 200).subscribe({
      next: (pagina) => {
        this.treinosDisponiveis.set(pagina.content);
        this.form.patchValue({ treinosIds: this.data.aluno.treinos.map((treino) => treino.id) });
        this.carregando.set(false);
      },
      error: (erro) => {
        this.erro.set(mensagemDeErro(erro, 'Não foi possível carregar as fichas.'));
        this.carregando.set(false);
      },
    });
  }

  salvar(): void {
    if (this.enviando()) return;

    this.enviando.set(true);
    this.erro.set(null);

    this.usuarioService
      .sincronizarTreinos(this.data.aluno.id, this.form.getRawValue().treinosIds)
      .subscribe({
        next: () => this.dialogRef.close(true),
        error: (erro) => {
          this.enviando.set(false);
          this.erro.set(mensagemDeErro(erro, 'Não foi possível salvar as fichas.'));
        },
      });
  }
}
