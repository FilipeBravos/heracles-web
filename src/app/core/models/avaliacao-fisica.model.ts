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
  observacoes: string | null;
  temFoto: boolean;
  dataCriacao: string;
}

/**
 * Corpo de uma avaliacao nova.
 *
 * `fotoBase64`/`fotoContentType` sao opcionais e sempre vem juntos — a
 * API recusa um sem o outro.
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
  observacoes: string | null;
  fotoBase64: string | null;
  fotoContentType: string | null;
}
