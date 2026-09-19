export type TipoNotificacao = 'MATRICULA_VENCENDO' | 'ANAMNESE_PENDENTE' | 'ANIVERSARIO';

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
};
