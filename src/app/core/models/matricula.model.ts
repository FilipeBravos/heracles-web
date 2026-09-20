export type TipoCobranca = 'RECORRENTE' | 'PACOTE_ANUAL';
export type OrigemAssinatura = 'DIRETO' | 'GYMPASS' | 'TOTALPASS' | 'INDICACAO';
export type StatusAssinatura = 'ATIVA' | 'INADIMPLENTE' | 'CANCELADA';
export type FormaPagamento = 'BOLETO' | 'PIX' | 'CARTAO';
export type StatusCobranca = 'PENDENTE' | 'PAGA' | 'CANCELADA';
export type EstagioLembrete = 'VENCE_EM_BREVE' | 'VENCIDA' | 'INADIMPLENTE';
export type CanalLembrete = 'WHATSAPP' | 'EMAIL';

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
  /** Só preenchido quando origem = INDICACAO. */
  indicadoPorAlunoId: number | null;
  indicadoPorNome: string | null;
  formaPagamento: FormaPagamento;
  dataInicio: string;
  dataVencimento: string;
  status: StatusAssinatura;
  dataCancelamento: string | null;
  /** Derivado da data pela API, não gravado: o status é o que o operador marcou. */
  vencida: boolean;
}

/**
 * Uma cobrança de um ciclo da assinatura — boleto, PIX ou cartão.
 *
 * Simulada: não há gateway de pagamento integrado, então "paga" aqui é
 * a secretaria confirmando o recebimento (o mesmo botão de renovar),
 * não um webhook de verdade. `codigoSimulado` existe só para a tela
 * parecer uma cobrança real; nulo no cartão, que não tem código copiável.
 */
export interface Cobranca {
  id: number;
  valor: number;
  formaPagamento: FormaPagamento;
  codigoSimulado: string | null;
  dataVencimento: string;
  status: StatusCobranca;
  dataPagamento: string | null;
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
  /** Só faz sentido quando origem = INDICACAO. */
  indicadoPorAlunoId: number | null;
  dataInicio: string | null;
  formaPagamento: FormaPagamento;
}

/** Veredito da catraca, com o motivo — cada um leva a um encaminhamento. */
export interface Acesso {
  liberado: boolean;
  motivo: MotivoAcesso;
  mensagem: string;
  assinatura: Assinatura | null;
}

/**
 * Uma linha do historico de frequencia do aluno.
 *
 * Nasce do mesmo veredito de `Acesso` — GET /assinaturas/acesso grava um
 * check-in a cada chamada, liberado ou barrado.
 */
export interface Checkin {
  id: number;
  unidadeNome: string;
  momento: string;
  liberado: boolean;
  motivo: MotivoAcesso;
}

/** Rótulo curto do motivo, para uma linha de histórico — não a frase de encaminhamento do balcão. */
export const ROTULO_MOTIVO_ACESSO: Readonly<Record<MotivoAcesso, string>> = {
  LIBERADO: 'Liberado',
  SEM_MATRICULA: 'Sem matrícula',
  INADIMPLENTE: 'Inadimplente',
  VENCIDA: 'Matrícula vencida',
  UNIDADE_NAO_COBERTA: 'Unidade não coberta',
};

export const TIPOS_COBRANCA: { valor: TipoCobranca; rotulo: string; periodo: string }[] = [
  { valor: 'RECORRENTE', rotulo: 'Mensal recorrente', periodo: 'vence a cada mês' },
  { valor: 'PACOTE_ANUAL', rotulo: 'Pacote anual', periodo: 'vence a cada 12 meses' },
];

export const ORIGENS_ASSINATURA: { valor: OrigemAssinatura; rotulo: string }[] = [
  { valor: 'DIRETO', rotulo: 'Matrícula direta' },
  { valor: 'GYMPASS', rotulo: 'Gympass' },
  { valor: 'TOTALPASS', rotulo: 'TotalPass' },
  { valor: 'INDICACAO', rotulo: 'Indicação de aluno' },
];

export const FORMAS_PAGAMENTO: { valor: FormaPagamento; rotulo: string }[] = [
  { valor: 'PIX', rotulo: 'PIX' },
  { valor: 'BOLETO', rotulo: 'Boleto' },
  { valor: 'CARTAO', rotulo: 'Cartão' },
];

export const ROTULO_FORMA_PAGAMENTO: Readonly<Record<FormaPagamento, string>> = {
  PIX: 'PIX',
  BOLETO: 'Boleto',
  CARTAO: 'Cartão',
};

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
  const dias = (emDatas(assinatura.dataVencimento) - emDatas(hoje)) / 86_400_000;
  return situacaoPor(assinatura.status, assinatura.vencida, dias);
}

/**
 * A regra em si, a partir do que já está decidido.
 *
 * Existe separada porque a lista do balcão e a tela do aluno chegam aqui
 * por caminhos diferentes — uma conta os dias no navegador, a outra
 * recebe a contagem pronta da API — e a classificação precisa ser a
 * mesma nos dois. Duas cópias divergiriam na primeira mudança, e aí o
 * mesmo aluno leria "em dia" numa tela e "vence em breve" na outra.
 */
function situacaoPor(
  status: StatusAssinatura,
  vencida: boolean,
  diasParaVencer: number
): SituacaoMatricula {
  if (status === 'CANCELADA') return 'CANCELADA';
  if (status === 'INADIMPLENTE') return 'INADIMPLENTE';
  if (vencida) return 'VENCIDA';
  return diasParaVencer <= DIAS_PARA_VENCER ? 'VENCE_EM_BREVE' : 'EM_DIA';
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
 * Uma linha do relatório de inadimplência.
 *
 * `cobrancaPendenteId`/`formaPagamento`/`codigoSimulado` saem nulos
 * quando não há cobrança em aberto para aquela assinatura (por exemplo,
 * logo após cancelar) — a tela não oferece "confirmar pagamento" nesse caso.
 */
export interface LinhaInadimplencia {
  assinaturaId: number;
  alunoId: number;
  alunoNome: string;
  planoNome: string;
  valorMensal: number;
  dataVencimento: string;
  status: StatusAssinatura;
  vencida: boolean;
  /** Mesma convenção de `Vencimento`: negativo quando já venceu. */
  diasParaVencer: number;
  cobrancaPendenteId: number | null;
  formaPagamento: FormaPagamento | null;
  codigoSimulado: string | null;
  /** Nulo quando o job diário ainda não gerou lembrete para o estágio atual. */
  ultimoLembreteCanal: CanalLembrete | null;
  ultimoLembreteEnviadoEm: string | null;
}

/** Um lembrete (simulado) já enviado para uma assinatura. */
export interface Lembrete {
  id: number;
  estagio: EstagioLembrete;
  canal: CanalLembrete;
  destinatario: string;
  dataEnvio: string;
}

/** Uma linha do ranking de indicações: quantas matrículas o aluno trouxe. */
export interface LinhaIndicacao {
  id: number;
  nome: string;
  quantidade: number;
}

/** Contagem por etapa da régua, para o cabeçalho do relatório de inadimplência. */
export interface ResumoInadimplencia {
  venceEmBreve: number;
  vencidas: number;
  inadimplentes: number;
}

/**
 * A régua de uma linha do relatório de inadimplência.
 *
 * Reaproveita a mesma regra de `situacaoDaMatricula`/`situacaoDaMinhaMatricula`
 * — as três telas precisam ler o mesmo aluno do mesmo jeito.
 */
export function situacaoDaLinhaInadimplencia(linha: LinhaInadimplencia): SituacaoMatricula {
  return situacaoPor(linha.status, linha.vencida, linha.diasParaVencer);
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

/**
 * A matrícula como o próprio aluno a vê.
 *
 * Não é a `Assinatura` do balcão: ele já sabe de quem ela é, e pergunta
 * outra coisa — até quando vale e onde pode treinar. Daí `unidades`, que
 * a listagem operacional não traz.
 *
 * Tudo é nulo quando `temMatricula` é falso, que é estado normal: aluno
 * recém-cadastrado que ainda não passou na recepção, ou matrícula
 * cancelada. A API responde 200 nesse caso, não 404.
 */
export interface MinhaMatricula {
  temMatricula: boolean;
  planoNome: string | null;
  valorMensal: number | null;
  tipoCobranca: TipoCobranca | null;
  origem: OrigemAssinatura | null;
  dataInicio: string | null;
  dataVencimento: string | null;
  status: StatusAssinatura | null;
  vencida: boolean;
  /** Contado pela API. Negativo quando já venceu. */
  diasParaVencer: number;
  /** Nomes das unidades que o plano cobre. */
  unidades: string[];
}

/**
 * Situação da própria matrícula, ou `null` quando não há nenhuma.
 *
 * Usa a contagem de dias que a API mandou em vez de refazer a conta com
 * o relógio do navegador: é o mesmo dia de hoje que decide `vencida` e o
 * veredito da catraca. Um relógio adiantado faria a tela do aluno
 * discordar da catraca sobre ele mesmo.
 */
export function situacaoDaMinhaMatricula(minha: MinhaMatricula): SituacaoMatricula | null {
  if (!minha.temMatricula || !minha.status) return null;
  return situacaoPor(minha.status, minha.vencida, minha.diasParaVencer);
}

/** Como a tela do aluno anuncia a situação: tom, ícone e as duas frases. */
export interface AvisoMatricula {
  situacao: SituacaoMatricula | null;
  tom: 'ok' | 'alerta' | 'perigo' | 'neutro';
  icone: string;
  titulo: string;
  detalhe: string;
}

/**
 * O aviso que abre a tela do aluno.
 *
 * Fica aqui, e não no componente, porque é a resposta à pergunta que
 * motivou a tela — "meu acesso está em dia?" — e ela merece teste. Cada
 * estado diz também o que fazer: saber que venceu sem saber que a
 * catraca vai barrar não resolve a ida perdida até a academia.
 */
export function avisoDaMinhaMatricula(minha: MinhaMatricula): AvisoMatricula {
  const situacao = situacaoDaMinhaMatricula(minha);
  const prazo = descreverPrazo(minha.diasParaVencer);
  const onde = ondeResolver(minha.origem);

  switch (situacao) {
    case 'EM_DIA':
      return {
        situacao,
        tom: 'ok',
        icone: 'check_circle',
        titulo: 'Seu acesso está em dia',
        detalhe: `Sua matrícula ${prazo}.`,
      };
    case 'VENCE_EM_BREVE':
      return {
        situacao,
        tom: 'alerta',
        icone: 'event_upcoming',
        titulo: 'Sua matrícula vence em breve',
        detalhe: `Ela ${prazo}. Renove ${onde} para não perder o acesso.`,
      };
    case 'VENCIDA':
      return {
        situacao,
        tom: 'perigo',
        icone: 'block',
        titulo: 'Sua matrícula está vencida',
        detalhe: `Ela ${prazo}. A catraca não libera até você renovar ${onde}.`,
      };
    case 'INADIMPLENTE':
      return {
        situacao,
        tom: 'perigo',
        icone: 'block',
        titulo: 'Pagamento em atraso',
        detalhe: `O acesso fica suspenso até o pagamento ser regularizado ${onde}.`,
      };
    default:
      // Sem matrícula vigente — inclui a cancelada, que a API não devolve
      // como vigente. Para o aluno as duas dão no mesmo: ele precisa
      // passar na recepção.
      return {
        situacao: null,
        tom: 'neutro',
        icone: 'card_membership',
        titulo: 'Você ainda não tem matrícula',
        detalhe: 'Procure a recepção da sua unidade para se matricular e liberar o acesso.',
      };
  }
}

/**
 * A quem o aluno recorre, pela origem da matrícula.
 *
 * Quem entrou por parceiro não renova no balcão — mandá-lo à recepção
 * seria uma ida perdida, que é exatamente o que esta tela existe para
 * evitar.
 */
function ondeResolver(origem: OrigemAssinatura | null): string {
  switch (origem) {
    case 'GYMPASS':
      return 'no aplicativo do Gympass';
    case 'TOTALPASS':
      return 'no aplicativo do TotalPass';
    default:
      return 'na recepção';
  }
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

/**
 * Um mês da série de churn. `taxaChurn` já vem calculada (0 a 1) — o
 * front só formata como porcentagem, nunca recalcula.
 */
export interface PontoChurn {
  mes: string;
  ativosNoInicio: number;
  cancelados: number;
  taxaChurn: number;
}

export interface HistoricoChurn {
  meses: number;
  pontos: PontoChurn[];
}

/** Uma linha do detalhamento de churn por plano ou por unidade, no mês de referência. */
export interface LinhaChurn {
  id: number;
  nome: string;
  ativosNoInicio: number;
  cancelados: number;
  taxaChurn: number;
}

/**
 * O painel de retenção inteiro: a tendência mensal e o detalhamento do
 * último mês fechado — o mês corrente fica de fora por estar
 * incompleto, e mostraria uma taxa artificialmente baixa.
 */
export interface Retencao {
  historico: HistoricoChurn;
  /** `yyyy-MM` do último mês fechado — o mesmo formato de PontoMensal.mes. */
  mesReferencia: string;
  porPlano: LinhaChurn[];
  porUnidade: LinhaChurn[];
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
