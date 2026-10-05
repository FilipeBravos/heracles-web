export type TipoNotificacao = 'MATRICULA_VENCENDO' | 'ANAMNESE_PENDENTE' | 'ANIVERSARIO' | 'VAGA_LIBERADA';

/**
 * Um aviso na central de notificacoes de quem esta autenticado.
 *
 * Sem e-mail nem push: sem servidor SMTP nem servico de push
 * configurado no projeto, o aviso vive dentro do proprio app, gerado
 * por um job diario e lido no sino da barra lateral.
 */
export interface Notificacao {
  id: number;
  tipo: TipoNotificacao;
  titulo: string;
  mensagem: string;
  lida: boolean;
  criadaEm: string;
}

/** So a contagem de nao lidas — o numero que o sino mostra sem abrir a lista. */
export interface ResumoNotificacoes {
  naoLidas: number;
}

export const ICONE_TIPO_NOTIFICACAO: Readonly<Record<TipoNotificacao, string>> = {
  MATRICULA_VENCENDO: 'card_membership',
  ANAMNESE_PENDENTE: 'assignment_turned_in',
  ANIVERSARIO: 'event_upcoming',
  VAGA_LIBERADA: 'how_to_reg',
};

export const ROTULO_TIPO_NOTIFICACAO: Readonly<Record<TipoNotificacao, string>> = {
  MATRICULA_VENCENDO: 'Matrícula vencendo',
  ANAMNESE_PENDENTE: 'Anamnese pendente',
  ANIVERSARIO: 'Aniversário',
  VAGA_LIBERADA: 'Vaga liberada',
};

/**
 * Taxa de leitura de um tipo de notificação no período, do pior pro melhor,
 * e o tempo médio até a leitura entre as que têm o momento de leitura
 * registrado.
 *
 * `tempoMedioLeituraHoras` é nulo quando nenhuma das lidas tem o momento
 * registrado — todas foram lidas antes do campo existir, ou nenhuma foi
 * lida ainda. Nunca é inferido.
 */
export interface LinhaTaxaLeituraNotificacao {
  tipo: TipoNotificacao;
  total: number;
  lidas: number;
  /** Percentual, de 0 a 100, já com uma casa decimal. */
  taxaLeitura: number;
  tempoMedioLeituraHoras: number | null;
}
