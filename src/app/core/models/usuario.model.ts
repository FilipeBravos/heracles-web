import { TreinoResumo } from './treino.model';

export type TipoPerfil = 'ALUNO' | 'PROFESSOR' | 'SECRETARIA' | 'ADMIN';
export type StatusUsuario = 'ATIVO' | 'INATIVO';

/** Espelha UsuarioResponse na API. Nao existe campo de senha, de proposito. */
export interface Usuario {
  id: number;
  nome: string;
  cpf: string;
  email: string;
  telefone: string | null;
  endereco: string | null;
  cep: string | null;
  dataNascimento: string | null;
  temFoto: boolean;
  planoEscolhidoId: number | null;
  planoEscolhidoNome: string | null;
  anamnesePreenchida: boolean;
  tipoPerfil: TipoPerfil;
  status: StatusUsuario;
  dataCadastro: string;
  treinos: TreinoResumo[];
}

/**
 * Espelha UsuarioRequests.Criar.
 *
 * Endereco, CEP, data de nascimento, foto e plano so existem de fato para
 * o aluno — a API so os exige quando tipoPerfil e ALUNO. Aqui ficam
 * opcionais porque o contrato tambem serve professor/secretaria/admin;
 * o formulario de aluno e quem decide marca-los como obrigatorios.
 */
export interface NovoUsuario {
  nome: string;
  cpf: string;
  email: string;
  telefone: string | null;
  endereco?: string | null;
  cep?: string | null;
  dataNascimento?: string | null;
  /** Base64 puro, sem o prefixo "data:image/...;base64,". */
  fotoBase64?: string | null;
  fotoContentType?: string | null;
  planoEscolhidoId?: number | null;
  tipoPerfil: TipoPerfil;
  senha: string;
  /**
   * O "clique para assinar" do contrato — nome digitado e aceite. Só
   * exigido pela API quando tipoPerfil é ALUNO, mesmo motivo de
   * endereco/cep/plano.
   */
  nomeAssinaturaContrato?: string | null;
  aceiteContrato?: boolean | null;
}

/**
 * Espelha UsuarioRequests.Atualizar — sem perfil e sem status, que nao sao
 * editaveis por aqui.
 *
 * fotoBase64/fotoContentType so devem ir preenchidos quando o usuario
 * escolhe uma foto nova: mandar os dois nulos preserva a foto que ja
 * existe, e mandar so um dos dois e erro na API.
 */
export interface EdicaoUsuario {
  nome: string;
  cpf: string;
  email: string;
  telefone: string | null;
  endereco?: string | null;
  cep?: string | null;
  dataNascimento?: string | null;
  fotoBase64?: string | null;
  fotoContentType?: string | null;
  planoEscolhidoId?: number | null;
}

/**
 * Espelha AnamneseDtos.Response.
 *
 * `preenchida` e o sinal de verdade: quando falso, todo o resto vem nulo
 * porque o aluno simplesmente ainda nao respondeu — não é erro.
 */
export interface Anamnese {
  preenchida: boolean;
  objetivo: string | null;
  condicoesSaude: string | null;
  lesoesCirurgias: string | null;
  medicamentosUso: string | null;
  restricoesMedicas: string | null;
  contatoEmergenciaNome: string | null;
  contatoEmergenciaTelefone: string | null;
  preenchidaEm: string | null;
}

/** Espelha AnamneseDtos.Salvar. */
export interface AnamneseForm {
  objetivo: string;
  condicoesSaude: string | null;
  lesoesCirurgias: string | null;
  medicamentosUso: string | null;
  restricoesMedicas: string | null;
  contatoEmergenciaNome: string;
  contatoEmergenciaTelefone: string;
}

/**
 * Uma linha do alerta de reavaliação vencida: matrícula ativa, mas a
 * última avaliação física passou da janela — ou nunca aconteceu.
 * `diasSemAvaliacao` nulo significa "nunca fez uma", não zero dias.
 */
export interface LinhaReavaliacaoVencida {
  alunoId: number;
  alunoNome: string;
  email: string;
  telefone: string | null;
  ultimaAvaliacao: string | null;
  diasSemAvaliacao: number | null;
}

/** Cabeçalho do alerta: quantos alunos com matrícula ativa estão com a reavaliação física vencida. */
export interface ResumoReavaliacaoVencida {
  total: number;
}

/**
 * Evolução física média por unidade: a média do delta (última avaliação
 * menos a primeira, no período) entre alunos com pelo menos duas
 * avaliações. Um delta nulo significa que nenhum aluno tinha aquela
 * medida nas duas pontas — não zero. Um aluno de plano de rede conta a
 * evolução em cada unidade que o plano cobre.
 */
export interface LinhaEvolucaoFisicaPorUnidade {
  unidadeNome: string;
  quantidadeAlunos: number;
  deltaPesoMedio: number | null;
  deltaPercentualGorduraMedio: number | null;
  deltaImcMedio: number | null;
}

/**
 * Cobertura de anamnese por unidade: entre alunos com matrícula vigente,
 * quantos já preencheram a anamnese, em percentual — do pior pro melhor.
 * Um aluno de plano de rede conta uma vez em cada unidade que o plano
 * cobre, mesmo espalhamento de LinhaEvolucaoFisicaPorUnidade.
 */
export interface LinhaCoberturaAnamnesePorUnidade {
  unidadeNome: string;
  quantidadeAlunos: number;
  quantidadeComAnamnese: number;
  percentualCobertura: number;
}

/** Uma linha do painel de aniversariantes do mês. */
export interface Aniversariante {
  alunoId: number;
  alunoNome: string;
  dataNascimento: string;
  telefone: string | null;
  email: string;
}
