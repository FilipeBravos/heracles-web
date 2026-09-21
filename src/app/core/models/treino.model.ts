/** Treino sem exercicios, como aparece na lista de fichas de um aluno. */
export interface TreinoResumo {
  id: number;
  nome: string;
  foco: string;
  nivel: string;
}

export interface Exercicio {
  id: number | null;
  nome: string;
  /** Numero de series prescritas. */
  series: number;
  /**
   * Faixa de repeticoes por serie. Quando a prescricao e exata, min e max
   * sao iguais; a formatacao para leitura fica em `descreverPrescricao`.
   */
  repeticoesMin: number;
  repeticoesMax: number;
  /** Prescricao de carga em texto ("ate a falha", "70% 1RM"), nao um peso. */
  carga: string | null;
  observacoes: string | null;
  ordem: number;
}

export interface Treino extends TreinoResumo {
  exercicios: Exercicio[];
  /** Repeticoes totais minimas da ficha, calculadas pela API. */
  volumePrescritoMinimo: number;
}

/** Espelha TreinoRequest. O id do exercicio e opcional: nulo significa "novo". */
export interface TreinoForm {
  nome: string;
  foco: string;
  nivel: string;
  exercicios: ExercicioForm[];
}

export interface ExercicioForm {
  id: number | null;
  nome: string;
  series: number;
  repeticoesMin: number;
  repeticoesMax: number;
  carga: string | null;
  observacoes: string | null;
}

/**
 * Formata a prescricao para leitura: "4x10 a 12" quando e faixa,
 * "3x12" quando e exata.
 *
 * Fica junto do modelo para que a forma de escrever a prescricao seja uma
 * decisao unica, e nao algo reinventado em cada template.
 */
export function descreverPrescricao(exercicio: Pick<Exercicio, 'series' | 'repeticoesMin' | 'repeticoesMax'>): string {
  const repeticoes =
    exercicio.repeticoesMax > exercicio.repeticoesMin
      ? `${exercicio.repeticoesMin} a ${exercicio.repeticoesMax}`
      : `${exercicio.repeticoesMin}`;

  return `${exercicio.series}x${repeticoes}`;
}

/**
 * Um aluno com matrícula ativa que nunca recebeu uma ficha de treino —
 * pagou, mas nunca foi "recebido" de verdade pelo treino.
 */
export interface LinhaAlunoSemFicha {
  alunoId: number;
  alunoNome: string;
  email: string;
  telefone: string | null;
  dataCadastro: string;
}

/** Cabeçalho do alerta: quantos alunos com matrícula ativa nunca receberam ficha de treino. */
export interface ResumoAlunosSemFicha {
  total: number;
}

/**
 * Uma ficha que o aluno já treinou e não treina mais.
 *
 * Nome, foco e nível vêm do registro histórico, não da ficha viva: ela
 * pode ter sido renomeada ou apagada desde a troca — o histórico descreve
 * o que o aluno treinou naquele período, não o que a ficha é hoje. Por
 * isso não há `exercicios` aqui: a prescrição exata daquele período não
 * fica guardada, só o nome, o foco e o nível que ele teve.
 */
export interface HistoricoTreino {
  nome: string;
  foco: string;
  nivel: string;
  /** yyyy-MM-dd */
  vinculadoEm: string;
  /** yyyy-MM-dd */
  desvinculadoEm: string;
}

/**
 * "de mar/26 a jun/26" — o período em que o aluno treinou a ficha.
 *
 * Ano abreviado nos dois lados: sem ele, uma troca em dezembro que vira
 * janeiro leria "de dez a jan" sem dizer que atravessou o ano.
 */
export function descreverPeriodo(historico: Pick<HistoricoTreino, 'vinculadoEm' | 'desvinculadoEm'>): string {
  return `de ${formatarMesAno(historico.vinculadoEm)} a ${formatarMesAno(historico.desvinculadoEm)}`;
}

const MESES_ABREVIADOS = [
  'jan', 'fev', 'mar', 'abr', 'mai', 'jun',
  'jul', 'ago', 'set', 'out', 'nov', 'dez',
];

function formatarMesAno(dataIso: string): string {
  const mes = Number(dataIso.slice(5, 7));
  const ano = dataIso.slice(2, 4);
  return `${MESES_ABREVIADOS[mes - 1] ?? dataIso}/${ano}`;
}
