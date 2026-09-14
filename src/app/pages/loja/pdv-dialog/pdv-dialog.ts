import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { CurrencyPipe } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSelectModule } from '@angular/material/select';

import {
  ItemCarrinho, METODOS_PAGAMENTO, MetodoPagamento, Produto, Unidade, Usuario,
} from '../../../core/models';
import { ProdutoService } from '../../../core/services/produto.service';
import { UnidadeService } from '../../../core/services/unidade.service';
import { UsuarioService } from '../../../core/services/usuario.service';
import { VendaService } from '../../../core/services/venda.service';
import { mensagemDeErro } from '../../../core/services/erro-api';

/**
 * Frente de caixa.
 *
 * O total mostrado aqui é só conferência para o operador: quem calcula o
 * valor cobrado é a API, a partir da tabela de preços. Se este número e o
 * da resposta divergissem, quem vale é o da resposta.
 */
@Component({
  selector: 'app-pdv-dialog',
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
    CurrencyPipe,
  ],
  templateUrl: './pdv-dialog.html',
})
export class PdvDialogComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly produtoService = inject(ProdutoService);
  private readonly unidadeService = inject(UnidadeService);
  private readonly usuarioService = inject(UsuarioService);
  private readonly vendaService = inject(VendaService);

  readonly dialogRef = inject(MatDialogRef<PdvDialogComponent>);

  readonly metodos = METODOS_PAGAMENTO;

  readonly carregando = signal(true);
  readonly enviando = signal(false);
  readonly erro = signal<string | null>(null);

  readonly unidades = signal<Unidade[]>([]);
  readonly produtos = signal<Produto[]>([]);
  readonly alunos = signal<Usuario[]>([]);
  readonly carrinho = signal<ItemCarrinho[]>([]);
  readonly busca = signal('');

  readonly form = this.fb.nonNullable.group({
    unidadeId: [null as number | null, Validators.required],
    alunoId: [null as number | null],
    metodoPagamento: ['PIX' as MetodoPagamento, Validators.required],
  });

  /** Só produtos à venda, da unidade escolhida e com saldo. */
  readonly disponiveis = computed(() => {
    const unidadeId = this.unidadeSelecionada();
    const termo = this.busca().trim().toLowerCase();

    return this.produtos()
      .filter((p) => p.ativo && p.quantidadeEstoque > 0 && (!unidadeId || p.unidadeId === unidadeId))
      .filter((p) => !termo || p.nome.toLowerCase().includes(termo)
        || (p.marca ?? '').toLowerCase().includes(termo));
  });

  readonly unidadeSelecionada = signal<number | null>(null);

  readonly total = computed(() =>
    this.carrinho().reduce((soma, item) => soma + item.produto.precoVenda * item.quantidade, 0)
  );

  readonly quantidadeTotal = computed(() =>
    this.carrinho().reduce((soma, item) => soma + item.quantidade, 0)
  );

  ngOnInit(): void {
    this.form.controls.unidadeId.valueChanges.subscribe((id) => {
      this.unidadeSelecionada.set(id);
      // Trocar de unidade invalida o carrinho: produto é por unidade, e a
      // API recusa item de outra.
      this.carrinho.set([]);
    });

    Promise.all([
      new Promise<void>((ok, falha) => this.unidadeService.listar().subscribe({
        next: (u) => { this.unidades.set(u); if (u.length === 1) this.form.patchValue({ unidadeId: u[0].id }); ok(); },
        error: falha,
      })),
      new Promise<void>((ok, falha) => this.produtoService.listar(0, 200, true).subscribe({
        next: (p) => { this.produtos.set(p.content); ok(); }, error: falha,
      })),
      new Promise<void>((ok) => this.usuarioService.listar(0, 200).subscribe({
        // A lista de alunos é conveniência: se falhar, a venda avulsa segue.
        next: (u) => { this.alunos.set(u.content.filter((a) => a.tipoPerfil === 'ALUNO')); ok(); },
        error: () => ok(),
      })),
    ]).then(
      () => this.carregando.set(false),
      (erro) => {
        this.erro.set(mensagemDeErro(erro, 'Não foi possível carregar os dados do caixa.'));
        this.carregando.set(false);
      }
    );
  }

  adicionar(produto: Produto): void {
    this.carrinho.update((itens) => {
      const existente = itens.find((i) => i.produto.id === produto.id);

      if (existente) {
        // Nunca passa do saldo: o botão some quando o carrinho esgota o estoque.
        if (existente.quantidade >= produto.quantidadeEstoque) return itens;
        return itens.map((i) =>
          i.produto.id === produto.id ? { ...i, quantidade: i.quantidade + 1 } : i);
      }
      return [...itens, { produto, quantidade: 1 }];
    });
  }

  remover(produtoId: number): void {
    this.carrinho.update((itens) =>
      itens.flatMap((i) => {
        if (i.produto.id !== produtoId) return [i];
        return i.quantidade > 1 ? [{ ...i, quantidade: i.quantidade - 1 }] : [];
      })
    );
  }

  tirarDoCarrinho(produtoId: number): void {
    this.carrinho.update((itens) => itens.filter((i) => i.produto.id !== produtoId));
  }

  noCarrinho(produtoId: number): number {
    return this.carrinho().find((i) => i.produto.id === produtoId)?.quantidade ?? 0;
  }

  atingiuEstoque(produto: Produto): boolean {
    return this.noCarrinho(produto.id) >= produto.quantidadeEstoque;
  }

  fechar(): void {
    if (this.form.invalid || this.carrinho().length === 0 || this.enviando()) {
      this.form.markAllAsTouched();
      return;
    }

    this.enviando.set(true);
    this.erro.set(null);

    const valores = this.form.getRawValue();

    this.vendaService.registrar({
      unidadeId: valores.unidadeId!,
      alunoId: valores.alunoId,
      metodoPagamento: valores.metodoPagamento,
      // Só produto e quantidade. Preço e total ficam com a API.
      itens: this.carrinho().map((i) => ({ produtoId: i.produto.id, quantidade: i.quantidade })),
    }).subscribe({
      next: (venda) => this.dialogRef.close(venda),
      error: (erro) => {
        this.enviando.set(false);
        // Estoque pode ter acabado entre abrir o caixa e fechar a venda:
        // a mensagem da API é específica e vale mais que um texto genérico.
        this.erro.set(mensagemDeErro(erro, 'Não foi possível registrar a venda.'));
      },
    });
  }
}
