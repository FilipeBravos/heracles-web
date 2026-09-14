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
  repeticoes: string;
  observacoes: string | null;
  ordem: number;
}

export interface Treino extends TreinoResumo {
  exercicios: Exercicio[];
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
  repeticoes: string;
  observacoes: string | null;
}
