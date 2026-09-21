export type DiaSemana = 'SEGUNDA' | 'TERCA' | 'QUARTA' | 'QUINTA' | 'SEXTA' | 'SABADO' | 'DOMINGO';

export const DIAS_SEMANA: { valor: DiaSemana; rotulo: string }[] = [
  { valor: 'SEGUNDA', rotulo: 'Segunda' },
  { valor: 'TERCA', rotulo: 'Terça' },
  { valor: 'QUARTA', rotulo: 'Quarta' },
  { valor: 'QUINTA', rotulo: 'Quinta' },
  { valor: 'SEXTA', rotulo: 'Sexta' },
  { valor: 'SABADO', rotulo: 'Sábado' },
  { valor: 'DOMINGO', rotulo: 'Domingo' },
];

export const ROTULO_DIA_SEMANA: Readonly<Record<DiaSemana, string>> = {
  SEGUNDA: 'Segunda',
  TERCA: 'Terça',
  QUARTA: 'Quarta',
  QUINTA: 'Quinta',
  SEXTA: 'Sexta',
  SABADO: 'Sábado',
  DOMINGO: 'Domingo',
};

/** Disponibilidade semanal do professor — informativa, para o balcão saber quando marcar com ele. */
export interface HorarioProfessor {
  id: number;
  diaSemana: DiaSemana;
  horaInicio: string;
  horaFim: string;
  unidadeId: number;
  unidadeNome: string;
}

export interface HorarioProfessorForm {
  diaSemana: DiaSemana;
  horaInicio: string;
  horaFim: string;
  unidadeId: number;
}

export type StatusAula = 'ATIVA' | 'CANCELADA';

/** Aula em grupo — visão operacional, com a ocupação da turma. */
export interface AulaGrupo {
  id: number;
  nome: string;
  professorId: number;
  professorNome: string;
  unidadeId: number;
  unidadeNome: string;
  dataHora: string;
  duracaoMinutos: number;
  capacidadeMaxima: number;
  vagasOcupadas: number;
  status: StatusAula;
}

/** A mesma aula, sob o olhar do aluno: se ele já está inscrito. */
export interface AulaGrupoParaAluno {
  id: number;
  nome: string;
  professorNome: string;
  unidadeNome: string;
  dataHora: string;
  duracaoMinutos: number;
  capacidadeMaxima: number;
  vagasOcupadas: number;
  inscrito: boolean;
  status: StatusAula;
}

export interface AulaGrupoForm {
  nome: string;
  professorId: number;
  unidadeId: number;
  dataHora: string;
  duracaoMinutos: number;
  capacidadeMaxima: number;
}

export type StatusAgendamento = 'AGENDADO' | 'REALIZADA' | 'CANCELADO';

export interface AgendamentoPersonal {
  id: number;
  alunoId: number;
  alunoNome: string;
  professorId: number;
  professorNome: string;
  unidadeId: number;
  unidadeNome: string;
  dataHora: string;
  duracaoMinutos: number;
  observacoes: string | null;
  status: StatusAgendamento;
  /** Nula até o aluno avaliar — só possível depois de REALIZADA. */
  notaAvaliacao: number | null;
  comentarioAvaliacao: string | null;
}

export interface AgendamentoPersonalForm {
  alunoId: number;
  professorId: number;
  unidadeId: number;
  dataHora: string;
  duracaoMinutos: number;
  observacoes: string | null;
}

/**
 * A avaliação que o aluno envia depois da sessão realizada — a mesma
 * pergunta que o motivo de cancelamento faz de outro jeito, mas aqui o
 * aluno ainda está engajado.
 */
export interface AvaliarSessaoPersonalForm {
  nota: number;
  comentario: string | null;
}

/** Uma linha do ranking de avaliação por professor: do melhor pro pior. */
export interface LinhaAvaliacaoProfessor {
  professorId: number;
  professorNome: string;
  notaMedia: number;
  quantidade: number;
}
