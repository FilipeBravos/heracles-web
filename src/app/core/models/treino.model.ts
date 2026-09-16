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
