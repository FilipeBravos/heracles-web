export type TipoCobranca = 'RECORRENTE' | 'PACOTE_ANUAL';
export type OrigemAssinatura = 'DIRETO' | 'GYMPASS' | 'TOTALPASS';
export type StatusAssinatura = 'ATIVA' | 'INADIMPLENTE' | 'CANCELADA';

export type MotivoAcesso =
  | 'LIBERADO'
  | 'SEM_MATRICULA'
  | 'INADIMPLENTE'
  | 'VENCIDA'
  | 'UNIDADE_NAO_COBERTA';

export interface UnidadeDoPlano {
  id: number;
  nome: string;
}

export interface Plano {
  id: number;
  nome: string;
  valorMensal: number;
  tipoCobranca: TipoCobranca;
  /** Plano fora de linha mantém quem já está nele, mas não aceita matrícula nova. */
  ativo: boolean;
  /** As unidades que o plano cobre — é o que ele vende. */
  unidades: UnidadeDoPlano[];
}

export interface PlanoForm {
  nome: string;
  valorMensal: number;
  tipoCobranca: TipoCobranca;
  unidadeIds: number[];
}

export interface Assinatura {
  id: number;
  alunoId: number;
  alunoNome: string;
  planoId: number;
  planoNome: string;
  valorMensal: number;
  origem: OrigemAssinatura;
  tokenParceiro: string | null;
  dataInicio: string;
  dataVencimento: string;
  status: StatusAssinatura;
  dataCancelamento: string | null;
  /** Derivado da data pela API, não gravado: o status é o que o operador marcou. */
  vencida: boolean;
}

/**
 * Corpo da matrícula.
 *
 * Sem data de vencimento: quem a calcula é a API, a partir do período do
 * plano. Mandar a data daqui seria deixar o cliente escolher até quando
 * o acesso vale.
 */
export interface MatricularForm {
  alunoId: number;
  planoId: number;
  origem: OrigemAssinatura;
  tokenParceiro: string | null;
  dataInicio: string | null;
}

/** Veredito da catraca, com o motivo — cada um leva a um encaminhamento. */
export interface Acesso {
  liberado: boolean;
  motivo: MotivoAcesso;
  mensagem: string;
  assinatura: Assinatura | null;
}

export const TIPOS_COBRANCA: { valor: TipoCobranca; rotulo: string; periodo: string }[] = [
  { valor: 'RECORRENTE', rotulo: 'Mensal recorrente', periodo: 'vence a cada mês' },
  { valor: 'PACOTE_ANUAL', rotulo: 'Pacote anual', periodo: 'vence a cada 12 meses' },
];

export const ORIGENS_ASSINATURA: { valor: OrigemAssinatura; rotulo: string }[] = [
  { valor: 'DIRETO', rotulo: 'Matrícula direta' },
  { valor: 'GYMPASS', rotulo: 'Gympass' },
  { valor: 'TOTALPASS', rotulo: 'TotalPass' },
];

/** Dentro de quantos dias um vencimento já entra na fila de cobrança. */
export const DIAS_PARA_VENCER = 7;

export type SituacaoMatricula = 'EM_DIA' | 'VENCE_EM_BREVE' | 'VENCIDA' | 'INADIMPLENTE' | 'CANCELADA';

/**
 * Como a matrícula se lê numa lista.
 *
 * Quatro estados e não dois: "vence em dois dias" e "vencida" pedem ações
 * diferentes no balcão, e inadimplente (a secretaria marcou por falta de
 * pagamento) não é o mesmo que vencida (só passou da data).
 *
 * `hoje` entra como parâmetro para a função ser determinística — é o que
 * torna o teste possível sem congelar o relógio.
 */
export function situacaoDaMatricula(assinatura: Assinatura, hoje: string): SituacaoMatricula {
  if (assinatura.status === 'CANCELADA') return 'CANCELADA';
  if (assinatura.status === 'INADIMPLENTE') return 'INADIMPLENTE';
  if (assinatura.vencida) return 'VENCIDA';

  const dias = (emDatas(assinatura.dataVencimento) - emDatas(hoje)) / 86_400_000;
  return dias <= DIAS_PARA_VENCER ? 'VENCE_EM_BREVE' : 'EM_DIA';
}

export const ROTULO_SITUACAO: Readonly<Record<SituacaoMatricula, string>> = {
  EM_DIA: 'Em dia',
  VENCE_EM_BREVE: 'Vence em breve',
  VENCIDA: 'Vencida',
  INADIMPLENTE: 'Inadimplente',
  CANCELADA: 'Cancelada',
};

export const CLASSE_SITUACAO: Readonly<Record<SituacaoMatricula, string>> = {
  EM_DIA: 'h-etiqueta--ok',
  VENCE_EM_BREVE: 'h-etiqueta--alerta',
  VENCIDA: 'h-etiqueta--perigo',
  INADIMPLENTE: 'h-etiqueta--perigo',
  CANCELADA: 'h-etiqueta--neutra',
};

/** Compara só a data: as duas pontas vêm como yyyy-MM-dd. */
function emDatas(iso: string): number {
  return Date.parse(`${iso}T00:00:00`);
}
