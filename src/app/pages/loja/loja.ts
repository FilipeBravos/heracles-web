import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { CurrencyPipe, DatePipe } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatPaginatorIntl, MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatTableModule } from '@angular/material/table';
import { MatTabsModule } from '@angular/material/tabs';
import { MatTooltipModule } from '@angular/material/tooltip';

import { LinhaProdutoParado, LinhaReposicaoEstoque, PainelVendas, Produto, Venda } from '../../core/models';
import { ProdutoService } from '../../core/services/produto.service';
import { VendaService } from '../../core/services/venda.service';
import { podeExecutar } from '../../core/acesso';
import { AuthService } from '../../core/services/auth.service';
import { mensagemDeErro } from '../../core/services/erro-api';
import { PaginadorIntl } from '../../core/paginador-intl';
import { ProdutoFormComponent } from './produto-form/produto-form';
import { PdvDialogComponent } from './pdv-dialog/pdv-dialog';

@Component({
  selector: 'app-loja',
  standalone: true,
  imports: [
    MatTableModule,
    MatButtonModule,
    MatIconModule,
    MatPaginatorModule,
    MatProgressSpinnerModule,
    MatTabsModule,
    MatTooltipModule,
    CurrencyPipe,
    DatePipe,
  ],
  templateUrl: './loja.html',
  providers: [{ provide: MatPaginatorIntl, useClass: PaginadorIntl }],
})
export class LojaComponent implements OnInit {
  private readonly produtoService = inject(ProdutoService);
  private readonly auth = inject(AuthService);

  /** A tela é alcançável por mais perfis do que esta ação. */
  readonly podeGerenciarProduto = computed(() =>
    podeExecutar('gerenciar-produto', this.auth.usuario()?.tipoPerfil)
  );
  private readonly vendaService = inject(VendaService);
  private readonly dialog = inject(MatDialog);
  private readonly snackBar = inject(MatSnackBar);

  /**
   * As três ações de produto são todas da administração. Para a secretaria
   * a coluna ficaria vazia — cabeçalho sem conteúdo é ruído, não pista.
   */
  readonly colunasProduto = computed(() =>
    this.podeGerenciarProduto()
      ? ['nome', 'preco', 'estoque', 'situacao', 'acoes']
      : ['nome', 'preco', 'estoque', 'situacao']
  );
  readonly colunasVenda = ['data', 'itens', 'pagamento', 'operador', 'total'];

  readonly produtos = signal<Produto[]>([]);
  readonly carregandoProdutos = signal(true);
  readonly erroProdutos = signal<string | null>(null);
  readonly totalProdutos = signal(0);
  readonly paginaProdutos = signal(0);

  readonly vendas = signal<Venda[]>([]);
  readonly carregandoVendas = signal(false);
  readonly erroVendas = signal<string | null>(null);
  readonly totalVendas = signal(0);
  readonly paginaVendas = signal(0);
  private vendasCarregadas = false;

  readonly colunasMaisVendidos = ['posicao', 'produto', 'quantidade', 'receita'];
  readonly colunasPorUnidade = ['unidade', 'faturamento', 'vendas', 'ticketMedio'];
  readonly relatorio = signal<PainelVendas | null>(null);
  readonly carregandoRelatorio = signal(false);
  readonly erroRelatorio = signal<string | null>(null);
  private relatorioCarregado = false;

  readonly colunasReposicao = ['produto', 'unidade', 'estoqueAtual', 'estoqueMinimo', 'quantidadeSugerida'];
  readonly reposicaoEstoque = signal<LinhaReposicaoEstoque[]>([]);
  readonly carregandoReposicao = signal(false);
  readonly erroReposicao = signal<string | null>(null);
  private reposicaoCarregada = false;

  readonly colunasParados = ['produto', 'unidade', 'ultimaVenda', 'diasParado'];
  readonly produtosParados = signal<LinhaProdutoParado[]>([]);
  readonly carregandoParados = signal(false);
  readonly erroParados = signal<string | null>(null);
  private paradosCarregados = false;

  ngOnInit(): void {
    this.listarProdutos();
  }

  listarProdutos(): void {
    this.carregandoProdutos.set(true);
    this.erroProdutos.set(null);

    this.produtoService.listar(this.paginaProdutos(), 20).subscribe({
      next: (pagina) => {
        this.produtos.set(pagina.content);
        this.totalProdutos.set(pagina.totalElements);
        this.carregandoProdutos.set(false);
      },
      error: (erro) => {
        this.erroProdutos.set(mensagemDeErro(erro, 'Não foi possível carregar os produtos.'));
        this.carregandoProdutos.set(false);
      },
    });
  }

  listarVendas(): void {
    this.carregandoVendas.set(true);
    this.erroVendas.set(null);

    this.vendaService.listar(this.paginaVendas(), 20).subscribe({
      next: (pagina) => {
        this.vendas.set(pagina.content);
        this.totalVendas.set(pagina.totalElements);
        this.carregandoVendas.set(false);
        this.vendasCarregadas = true;
      },
      error: (erro) => {
        this.erroVendas.set(mensagemDeErro(erro, 'Não foi possível carregar as vendas.'));
        this.carregandoVendas.set(false);
      },
    });
  }

  /** Só busca o histórico/relatório quando a aba é aberta pela primeira vez. */
  aoTrocarAba(indice: number): void {
    if (indice === 1 && !this.vendasCarregadas) {
      this.listarVendas();
    }
    if (indice === 2 && !this.relatorioCarregado) {
      this.carregarRelatorio();
    }
    if (indice === 3 && !this.reposicaoCarregada) {
      this.carregarReposicaoEstoque();
    }
    if (indice === 4 && !this.paradosCarregados) {
      this.carregarProdutosParados();
    }
  }

  mudarPaginaProdutos(evento: PageEvent): void {
    this.paginaProdutos.set(evento.pageIndex);
    this.listarProdutos();
  }

  mudarPaginaVendas(evento: PageEvent): void {
    this.paginaVendas.set(evento.pageIndex);
    this.listarVendas();
  }

  abrirFormularioProduto(produto: Produto | null): void {
    this.dialog
      .open(ProdutoFormComponent, { width: '560px', data: { produto } })
      .afterClosed()
      .subscribe((salvou) => {
        if (salvou) {
          this.snackBar.open(produto ? 'Produto atualizado.' : 'Produto cadastrado.', 'Fechar', { duration: 4000 });
          this.listarProdutos();
        }
      });
  }

  abrirPdv(): void {
    this.dialog
      .open(PdvDialogComponent, { width: '780px', maxWidth: '94vw' })
      .afterClosed()
      .subscribe((venda: Venda | undefined) => {
        if (venda) {
          this.snackBar.open(
            `Venda registrada: ${venda.itens.length} item(ns).`, 'Fechar', { duration: 5000 });
          // O estoque mudou; e o histórico, se já estiver carregado.
          this.listarProdutos();
          if (this.vendasCarregadas) {
            this.paginaVendas.set(0);
            this.listarVendas();
          }
        }
      });
  }

  alternarAtivo(produto: Produto, evento: Event): void {
    evento.stopPropagation();

    const acao = produto.ativo ? 'tirar de linha' : 'voltar a vender';
    if (!confirm(`Deseja ${acao} o produto "${produto.nome}"?`)) {
      return;
    }

    this.produtoService.alternarAtivo(produto.id).subscribe({
      next: () => {
        this.snackBar.open(produto.ativo ? 'Produto fora de linha.' : 'Produto reativado.', 'Fechar', { duration: 4000 });
        this.listarProdutos();
      },
      error: (erro) => this.snackBar.open(mensagemDeErro(erro), 'Fechar', { duration: 6000 }),
    });
  }

  registrarEntrada(produto: Produto, evento: Event): void {
    evento.stopPropagation();

    const entrada = prompt(`Entrada de estoque para "${produto.nome}".\nQuantas unidades chegaram?`, '10');
    if (entrada === null) return;

    const quantidade = Number(entrada);
    if (!Number.isInteger(quantidade) || quantidade < 1) {
      this.snackBar.open('Informe um número inteiro maior que zero.', 'Fechar', { duration: 5000 });
      return;
    }

    this.produtoService.registrarEntrada(produto.id, quantidade).subscribe({
      next: (atualizado) => {
        this.snackBar.open(
          `Entrada registrada. Estoque de "${atualizado.nome}": ${atualizado.quantidadeEstoque}.`,
          'Fechar', { duration: 5000 });
        this.listarProdutos();
      },
      error: (erro) => this.snackBar.open(mensagemDeErro(erro), 'Fechar', { duration: 6000 }),
    });
  }

  estoqueBaixo(produto: Produto): boolean {
    return produto.ativo && produto.quantidadeEstoque < produto.estoqueMinimo;
  }

  resumoItens(venda: Venda): string {
    return venda.itens.map((i) => `${i.quantidade}× ${i.produtoNome}`).join(', ');
  }

  rotuloPagamento(venda: Venda): string {
    return { PIX: 'PIX', DINHEIRO: 'Dinheiro', DEBITO: 'Débito', CREDITO: 'Crédito' }[venda.metodoPagamento];
  }

  // ---------------------------------------------------------------
  // Relatório de vendas
  // ---------------------------------------------------------------

  carregarRelatorio(): void {
    this.carregandoRelatorio.set(true);
    this.erroRelatorio.set(null);

    this.vendaService.relatorio(30).subscribe({
      next: (relatorio) => {
        this.relatorio.set(relatorio);
        this.carregandoRelatorio.set(false);
        this.relatorioCarregado = true;
      },
      error: (erro) => {
        this.erroRelatorio.set(mensagemDeErro(erro, 'Não foi possível carregar o relatório de vendas.'));
        this.carregandoRelatorio.set(false);
      },
    });
  }

  carregarReposicaoEstoque(): void {
    this.carregandoReposicao.set(true);
    this.erroReposicao.set(null);

    this.produtoService.reposicaoEstoque().subscribe({
      next: (linhas) => {
        this.reposicaoEstoque.set(linhas);
        this.carregandoReposicao.set(false);
        this.reposicaoCarregada = true;
      },
      error: (erro) => {
        this.erroReposicao.set(mensagemDeErro(erro, 'Não foi possível carregar a sugestão de reposição.'));
        this.carregandoReposicao.set(false);
      },
    });
  }

  carregarProdutosParados(): void {
    this.carregandoParados.set(true);
    this.erroParados.set(null);

    this.produtoService.produtosParados().subscribe({
      next: (linhas) => {
        this.produtosParados.set(linhas);
        this.carregandoParados.set(false);
        this.paradosCarregados = true;
      },
      error: (erro) => {
        this.erroParados.set(mensagemDeErro(erro, 'Não foi possível carregar os produtos parados.'));
        this.carregandoParados.set(false);
      },
    });
  }
}
