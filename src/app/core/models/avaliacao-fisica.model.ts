/**
 * Uma avaliacao fisica periodica do aluno — complementar a anamnese, que
 * e so o intake inicial.
 *
 * Diferente da anamnese, nao ha edicao: cada visita gera uma linha nova,
 * e a evolucao esta em comparar uma com a anterior no historico.
 */
export interface AvaliacaoFisica {
  id: number;
  data: string;
  pesoKg: number;
  alturaCm: number;
  /** Calculado pela API a partir de peso e altura — nunca gravado. */
  imc: number | null;
  percentualGordura: number | null;
  circunferenciaCintura: number | null;
  circunferenciaQuadril: number | null;
  circunferenciaBraco: number | null;
  circunferenciaCoxa: number | null;
  circunferenciaPeito: number | null;
  observacoes: string | null;
  /** Ids das fotos da galeria, na ordem de upload — cada uma se busca à parte. */
  fotoIds: number[];
  dataCriacao: string;
}

/** Uma foto da galeria, em base64 puro (sem o prefixo "data:image/...;base64,"). */
export interface FotoAvaliacaoForm {
  base64: string;
  contentType: string;
}

/**
 * Corpo de uma avaliacao nova.
 *
 * `fotos` e opcional (galeria vazia é uma avaliação sem foto).
 */
export interface AvaliacaoFisicaForm {
  data: string | null;
  pesoKg: number;
  alturaCm: number;
  percentualGordura: number | null;
  circunferenciaCintura: number | null;
  circunferenciaQuadril: number | null;
  circunferenciaBraco: number | null;
  circunferenciaCoxa: number | null;
  circunferenciaPeito: number | null;
  observacoes: string | null;
  fotos: FotoAvaliacaoForm[];
}

/**
 * A diferença entre duas avaliações, campo a campo (mais recente menos
 * mais antiga). `null` quando falta a medida em um dos dois lados.
 */
export interface DeltaFisico {
  pesoKg: number | null;
  alturaCm: number | null;
  imc: number | null;
  percentualGordura: number | null;
  circunferenciaCintura: number | null;
  circunferenciaQuadril: number | null;
  circunferenciaBraco: number | null;
  circunferenciaCoxa: number | null;
  circunferenciaPeito: number | null;
}

/**
 * O comparativo entre duas avaliações — a mais antiga e a mais recente
 * por padrão, ou duas escolhidas.
 *
 * `disponivel: false` quando há menos de duas avaliações: não há o que
 * comparar ainda, e isso é normal, não erro.
 */
export interface ComparativoFisico {
  disponivel: boolean;
  de: AvaliacaoFisica | null;
  para: AvaliacaoFisica | null;
  delta: DeltaFisico | null;
}
