import { Component, OnInit, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSelectModule } from '@angular/material/select';

import { Produto, Unidade } from '../../../core/models';
import { ProdutoService } from '../../../core/services/produto.service';
import { UnidadeService } from '../../../core/services/unidade.service';
import { mensagemDeErro } from '../../../core/services/erro-api';

export interface ProdutoFormData {
  produto: Produto | null;
}

@Component({
  selector: 'app-produto-form',
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
  templateUrl: './produto-form.html',
})
export class ProdutoFormComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly produtoService = inject(ProdutoService);
  private readonly unidadeService = inject(UnidadeService);

  readonly dialogRef = inject(MatDialogRef<ProdutoFormComponent>);
  readonly data = inject<ProdutoFormData>(MAT_DIALOG_DATA);

  readonly produto = this.data?.produto ?? null;
  readonly isEditMode = this.produto !== null;
  readonly enviando = signal(false);
  readonly carregandoUnidades = signal(true);
  readonly erro = signal<string | null>(null);
  readonly unidades = signal<Unidade[]>([]);

  readonly form = this.fb.nonNullable.group({
    unidadeId: [this.produto?.unidadeId ?? null as number | null, Validators.required],
    nome: [this.produto?.nome ?? '', [Validators.required, Validators.maxLength(100)]],
    marca: [this.produto?.marca ?? ''],
    precoVenda: [this.produto?.precoVenda ?? null as number | null,
      [Validators.required, Validators.min(0.01)]],
    // Só no cadastro: depois o saldo se move por entrada e por venda.
    quantidadeEstoque: [this.produto?.quantidadeEstoque ?? 0,
      [Validators.required, Validators.min(0)]],
  });

  ngOnInit(): void {
    if (this.isEditMode) {
      // Editar o cadastro não reescreve o saldo: uma venda registrada entre
      // a abertura do formulário e o salvamento seria apagada em silêncio.
      this.form.controls.quantidadeEstoque.disable();
    }

    this.unidadeService.listar().subscribe({
      next: (unidades) => {
        this.unidades.set(unidades);
        if (!this.isEditMode && unidades.length === 1) {
          this.form.patchValue({ unidadeId: unidades[0].id });
        }
        this.carregandoUnidades.set(false);
      },
      error: (erro) => {
        this.erro.set(mensagemDeErro(erro, 'Não foi possível carregar as unidades.'));
        this.carregandoUnidades.set(false);
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
    const payload = {
      unidadeId: valores.unidadeId!,
      nome: valores.nome.trim(),
      marca: valores.marca.trim() || null,
      precoVenda: Number(valores.precoVenda),
      quantidadeEstoque: Number(valores.quantidadeEstoque),
    };

    const requisicao = this.produto
      ? this.produtoService.atualizar(this.produto.id, payload)
      : this.produtoService.criar(payload);

    requisicao.subscribe({
      next: () => this.dialogRef.close(true),
      error: (erro) => {
        this.enviando.set(false);
        this.erro.set(mensagemDeErro(erro, 'Não foi possível salvar o produto.'));
      },
    });
  }
}
