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

/** Linha da fila de vencimentos do painel. */
export interface Vencimento {
  assinaturaId: number;
  alunoId: number;
  alunoNome: string;
  planoNome: string;
  dataVencimento: string;
  status: StatusAssinatura;
  /** Calculado pela API. Negativo quando já venceu. */
  diasParaVencer: number;
}

export interface FilaDeVencimentos {
  dias: number;
  /** A fila inteira, não só o que veio na lista. */
  total: number;
  itens: Vencimento[];
}

/**
 * Como o prazo se lê numa linha.
 *
 * "em 3 dias" e "há 3 dias" ocupam o mesmo espaço e dizem coisas
 * opostas — o sinal do número não pode ser a única diferença visível.
 */
export function descreverPrazo(diasParaVencer: number): string {
  if (diasParaVencer < -1) return `venceu há ${-diasParaVencer} dias`;
  if (diasParaVencer === -1) return 'venceu ontem';
  if (diasParaVencer === 0) return 'vence hoje';
  if (diasParaVencer === 1) return 'vence amanhã';
  return `vence em ${diasParaVencer} dias`;
}

/**
 * Urgência da linha: o que já venceu grita, o que vence esta semana
 * chama, o resto é contexto.
 */
export function urgenciaDoPrazo(diasParaVencer: number): 'vencido' | 'proximo' | 'distante' {
  if (diasParaVencer < 0) return 'vencido';
  return diasParaVencer <= DIAS_PARA_VENCER ? 'proximo' : 'distante';
}

/** Um mês da série do gráfico. `mes` vem como `yyyy-MM`. */
export interface PontoMensal {
  mes: string;
  quantidade: number;
}

export interface HistoricoMensal {
  meses: number;
  /** Soma do período — o cabeçalho mostra sem obrigar a somar as barras. */
  total: number;
  pontos: PontoMensal[];
}

const MESES_ABREVIADOS = [
  'jan', 'fev', 'mar', 'abr', 'mai', 'jun',
  'jul', 'ago', 'set', 'out', 'nov', 'dez',
];

/**
 * Rótulo curto do eixo: "set".
 *
 * Tabela fixa em vez de `toLocaleDateString`: o navegador devolve com
 * ponto ("set.") em alguns locales e o eixo fica sujo, e o idioma da
 * interface não é o do navegador.
 */
export function rotularMes(mesIso: string): string {
  const mes = Number(mesIso.slice(5, 7));
  return MESES_ABREVIADOS[mes - 1] ?? mesIso;
}

/** Ano com dois dígitos, para ancorar a virada. */
export function rotularAno(mesIso: string): string {
  return mesIso.slice(2, 4);
}

/** Nome por extenso, para o rótulo acessível e o tooltip. */
export function descreverMes(mesIso: string): string {
  const extenso = [
    'janeiro', 'fevereiro', 'março', 'abril', 'maio', 'junho',
    'julho', 'agosto', 'setembro', 'outubro', 'novembro', 'dezembro',
  ];
  const mes = Number(mesIso.slice(5, 7));
  return `${extenso[mes - 1] ?? mesIso} de ${mesIso.slice(0, 4)}`;
}

export interface EscalaGrafico {
  /** Topo do eixo: sempre um número redondo, nunca o maior valor cru. */
  maximo: number;
  /** As marcas do eixo, de baixo para cima, incluindo 0 e o máximo. */
  marcas: number[];
}

/**
 * Escala do eixo vertical, arredondada para números limpos.
 *
 * Um eixo que termina exatamente no maior valor faz a barra mais alta
 * encostar no topo e tira a referência de quanto falta; e uma marca como
 * "13" não ajuda ninguém a ler as outras barras. Daí o passo em 1, 2, 5
 * ou 10 e o topo no próximo múltiplo.
 */
export function escalaDoGrafico(valores: number[]): EscalaGrafico {
  const maior = Math.max(0, ...valores);

  // Série toda zerada ainda precisa de um eixo: sem ele não há o que
  // desenhar, e o painel pareceria quebrado em vez de vazio.
  if (maior === 0) return { maximo: 4, marcas: [0, 2, 4] };

  const alvo = maior / 4; // queremos cerca de quatro faixas
  const magnitude = 10 ** Math.floor(Math.log10(alvo));
  const passo = ([1, 2, 5, 10].find((m) => magnitude * m >= alvo) ?? 10) * magnitude;
  const maximo = Math.ceil(maior / passo) * passo;

  const marcas: number[] = [];
  for (let v = 0; v <= maximo + 1e-9; v += passo) marcas.push(Math.round(v));
  return { maximo, marcas };
}
