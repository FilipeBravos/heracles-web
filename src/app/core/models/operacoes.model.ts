/** Formas de pagamento aceitas no balcão. */
export type MetodoPagamento = 'PIX' | 'CREDITO' | 'DEBITO' | 'DINHEIRO';
export type StatusEquipamento = 'OK' | 'EM_MANUTENCAO';
export type StatusChamado = 'ABERTO' | 'RESOLVIDO';

export interface Produto {
  id: number;
  unidadeId: number;
  unidadeNome: string;
  nome: string;
  marca: string | null;
  precoVenda: number;
  quantidadeEstoque: number;
  /** Produto fora de linha continua no histórico de vendas, mas não vende. */
  ativo: boolean;
}

export interface ProdutoForm {
  unidadeId: number;
  nome: string;
  marca: string | null;
  precoVenda: number;
  quantidadeEstoque: number;
}

export interface ItemVenda {
  produtoId: number;
  produtoNome: string;
  quantidade: number;
  precoUnitario: number;
  subtotal: number;
}

export interface Venda {
  id: number;
  unidadeId: number;
  unidadeNome: string;
  operadorNome: string;
  alunoId: number | null;
  alunoNome: string | null;
  valorTotal: number;
  dataVenda: string;
  metodoPagamento: MetodoPagamento;
  itens: ItemVenda[];
}

/**
 * Corpo do fechamento de venda.
 *
 * Só produto e quantidade: preço e total são calculados pela API a partir
 * da tabela de preços. Mandar valor daqui seria deixar o cliente decidir
 * quanto custa.
 */
export interface VendaForm {
  unidadeId: number;
  alunoId: number | null;
  metodoPagamento: MetodoPagamento;
  itens: { produtoId: number; quantidade: number }[];
}

/** Linha do carrinho antes do fechamento — só existe no navegador. */
export interface ItemCarrinho {
  produto: Produto;
  quantidade: number;
}

export interface Equipamento {
  id: number;
  unidadeId: number;
  unidadeNome: string;
  nome: string;
  statusAtual: StatusEquipamento;
}

export interface EquipamentoForm {
  unidadeId: number;
  nome: string;
}

export interface ChamadoManutencao {
  id: number;
  dataChamado: string;
  descricaoProblema: string;
  custoReparo: number | null;
  status: StatusChamado;
  dataResolucao: string | null;
}

/** Uma linha do ranking de produtos mais vendidos: do mais vendido pro menos. */
export interface LinhaProdutoMaisVendido {
  produtoId: number;
  produtoNome: string;
  quantidadeVendida: number;
  receitaTotal: number;
}

/** Faturamento, número de vendas e ticket médio de uma unidade no período. */
export interface LinhaVendaPorUnidade {
  unidadeId: number;
  unidadeNome: string;
  faturamentoTotal: number;
  quantidadeVendas: number;
  ticketMedio: number;
}

/**
 * O relatório de vendas da loja: o resumo do período, os produtos mais
 * vendidos e a comparação entre unidades.
 */
export interface PainelVendas {
  dias: number;
  faturamentoTotal: number;
  quantidadeVendas: number;
  ticketMedio: number;
  maisVendidos: LinhaProdutoMaisVendido[];
  porUnidade: LinhaVendaPorUnidade[];
}

export const METODOS_PAGAMENTO: { valor: MetodoPagamento; rotulo: string }[] = [
  { valor: 'PIX', rotulo: 'PIX' },
  { valor: 'DINHEIRO', rotulo: 'Dinheiro' },
  { valor: 'DEBITO', rotulo: 'Cartão de débito' },
  { valor: 'CREDITO', rotulo: 'Cartão de crédito' },
];
