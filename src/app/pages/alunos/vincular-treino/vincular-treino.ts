import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialog, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSelectModule } from '@angular/material/select';

import { Treino, Usuario } from '../../../core/models';
import { TreinoService } from '../../../core/services/treino.service';
import { UsuarioService } from '../../../core/services/usuario.service';
import { mensagemDeErro } from '../../../core/services/erro-api';
import { AnamneseDialogComponent } from '../anamnese-dialog/anamnese-dialog';

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
  private readonly dialog = inject(MatDialog);

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

  private readonly selecaoAtual = signal<number[]>([]);
  /** Preenchida na hora, sem esperar a lista recarregar da API. */
  private readonly anamneseFoiPreenchidaAgora = signal(false);

  readonly anamnesePendente = computed(
    () => !this.data.aluno.anamnesePreenchida && !this.anamneseFoiPreenchidaAgora()
  );

  /** Adicionar ficha exige anamnese; desvincular tudo (lista vazia) nunca exige. */
  readonly bloqueadoPorAnamnese = computed(
    () => this.anamnesePendente() && this.selecaoAtual().length > 0
  );

  ngOnInit(): void {
    // Tamanho generoso: o seletor precisa de todas as fichas, não de uma página.
    this.treinoService.listar(0, 200).subscribe({
      next: (pagina) => {
        this.treinosDisponiveis.set(pagina.content);
        const idsAtuais = this.data.aluno.treinos.map((treino) => treino.id);
        this.form.patchValue({ treinosIds: idsAtuais });
        this.selecaoAtual.set(idsAtuais);
        this.carregando.set(false);
      },
      error: (erro) => {
        this.erro.set(mensagemDeErro(erro, 'Não foi possível carregar as fichas.'));
        this.carregando.set(false);
      },
    });

    this.form.controls.treinosIds.valueChanges.subscribe((ids) => this.selecaoAtual.set(ids));
  }

  abrirAnamnese(): void {
    this.dialog
      .open(AnamneseDialogComponent, {
        width: '600px',
        panelClass: '!rounded-none',
        data: { aluno: this.data.aluno },
      })
      .afterClosed()
      .subscribe((salvou) => {
        if (salvou) {
          this.anamneseFoiPreenchidaAgora.set(true);
        }
      });
  }

  salvar(): void {
    if (this.enviando() || this.bloqueadoPorAnamnese()) return;

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
