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

export type StatusInscricao = 'INSCRITA' | 'EM_ESPERA';

/**
 * O que aconteceu ao tentar marcar a vaga: entrou direto (INSCRITA) ou a
 * turma estava cheia e foi para a fila (EM_ESPERA, com a posição).
 */
export interface ResultadoInscricao {
  status: StatusInscricao;
  posicaoEspera: number | null;
}

/** Aula em grupo — visão operacional, com a ocupação e a fila de espera da turma. */
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
  vagasEspera: number;
  status: StatusAula;
}

/** A mesma aula, sob o olhar do aluno: se ele já está inscrito, ou sua posição na fila de espera. */
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
  /** Posição (1-based) na fila de espera, ou null se não está nela. */
  posicaoEspera: number | null;
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

/**
 * A taxa de cancelamento em cima da hora de um professor, do pior pro
 * melhor. Só entram sessões finalizadas (realizadas ou canceladas); e só
 * cancelamentos com menos de 24h de antecedência contam como "em cima da
 * hora" — cancelar com folga não atrapalha a agenda do jeito que cancelar
 * de última hora atrapalha.
 */
export interface LinhaCancelamentoProfessor {
  professorId: number;
  professorNome: string;
  totalSessoes: number;
  cancelamentosEmCimaDaHora: number;
  taxaCancelamento: number;
}

/**
 * A taxa de ocupação da agenda de um professor, do menos ocupado pro mais
 * ocupado: horas disponíveis (a partir do horário configurado, escaladas
 * pro período) contra horas efetivamente ocupadas por sessões realizadas.
 * Só entra professor com horário cadastrado.
 */
export interface LinhaOcupacaoPersonal {
  professorId: number;
  professorNome: string;
  horasDisponiveis: number;
  horasOcupadas: number;
  taxaOcupacao: number;
}

/** O ranking de sessões de personal realizadas por professor, do mais cheio pro menos cheio. */
export interface LinhaSessoesPorProfessor {
  professorId: number;
  professorNome: string;
  quantidadeSessoes: number;
}

/** Uma vaga marcada no roster da aula — o que o professor confere pra confirmar presença. */
export interface LinhaPresenca {
  alunoId: number;
  alunoNome: string;
  /** Nulo até o professor confirmar; true = compareceu, false = faltou. */
  presente: boolean | null;
}

/** Uma linha do ranking de faltas por aluno: de quem mais falta pra quem menos falta. */
export interface LinhaFaltaAluno {
  alunoId: number;
  alunoNome: string;
  faltas: number;
  presencas: number;
}

/** O relatório de faltas: taxa de comparecimento geral e o ranking de quem mais falta. */
export interface PainelPresenca {
  dias: number;
  totalConfirmadas: number;
  totalFaltas: number;
  taxaComparecimento: number;
  maisFaltosos: LinhaFaltaAluno[];
}

/**
 * Taxa de no-show de um horário recorrente (mesma aula, unidade, dia da
 * semana e hora), do pior pro melhor — pra decisão de agenda.
 * `ocorrencias` conta datas distintas, não confirmações de presença.
 */
export interface LinhaNoShowPorHorario {
  nomeAula: string;
  unidadeId: number;
  unidadeNome: string;
  professorNome: string;
  diaSemana: DiaSemana;
  horario: string;
  ocorrencias: number;
  faltas: number;
  presencas: number;
  taxaNoShow: number;
}

/**
 * A taxa de presença em aula em grupo de um professor no período, do pior
 * pro melhor — mistura todas as aulas que ele dá, diferente da taxa de
 * no-show por horário, que separa por dia/hora.
 */
export interface LinhaPresencaPorProfessor {
  professorNome: string;
  totalConfirmadas: number;
  faltas: number;
  presencas: number;
  taxaPresenca: number;
}

/**
 * Um bloco de 30 minutos, por unidade e dia da semana, sem nenhum
 * professor cobrindo — dentro do horário comercial fixo (06h-22h). Lacuna
 * bruta da agenda, diferente da taxa de ocupação, que só olha professores
 * que já têm horário cadastrado.
 */
export interface LinhaCoberturaHorario {
  unidadeId: number;
  unidadeNome: string;
  diaSemana: DiaSemana;
  horaInicio: string;
  horaFim: string;
}
