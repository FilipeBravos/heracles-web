import { TipoPerfil } from './models';

/**
 * Uma área navegável do sistema e quem alcança.
 *
 * Os perfis saem do que a API de fato autoriza para a tela funcionar
 * inteira — não do que ela deixa ler. A secretaria lê `GET /api/treinos`,
 * por exemplo, mas a tela de Treinos cria e edita ficha, e ela não pode;
 * oferecer o item seria oferecer uma tela onde todo botão devolve 403.
 */
export interface Area {
  /** Caminho completo, como o routerLink usa. */
  readonly rota: string;
  readonly rotulo: string;
  readonly icone: string;
  readonly perfis: readonly TipoPerfil[];
  /** Separa a faixa "Operação" no menu. */
  readonly grupo?: 'operacao';
}

const TODOS_OPERACIONAIS: readonly TipoPerfil[] = ['ADMIN', 'SECRETARIA', 'PROFESSOR'];
const BALCAO: readonly TipoPerfil[] = ['ADMIN', 'SECRETARIA'];

/**
 * A tabela única de acesso da interface.
 *
 * O menu e o guard de rota leem daqui. Se fossem duas listas, elas
 * divergiriam na primeira mudança — e um item de menu que leva a um 403
 * é pior que item nenhum.
 */
export const AREAS: readonly Area[] = [
  { rota: '/dashboard', rotulo: 'Visão geral', icone: 'dashboard', perfis: TODOS_OPERACIONAIS },
  { rota: '/dashboard/alunos', rotulo: 'Alunos', icone: 'groups', perfis: TODOS_OPERACIONAIS },
  // Prescrição é do professor e da administração; a secretaria vincula
  // ficha pronta pela tela de Alunos, que usa outra rota.
  { rota: '/dashboard/treinos', rotulo: 'Treinos', icone: 'fitness_center', perfis: ['ADMIN', 'PROFESSOR'] },
  { rota: '/dashboard/matriculas', rotulo: 'Matrículas', icone: 'card_membership', perfis: BALCAO },
  { rota: '/dashboard/loja', rotulo: 'Loja', icone: 'point_of_sale', perfis: BALCAO, grupo: 'operacao' },
  { rota: '/dashboard/equipamentos', rotulo: 'Equipamentos', icone: 'build', perfis: TODOS_OPERACIONAIS, grupo: 'operacao' },
  // Cadastro de unidade é estrutura da rede: só a administração escreve,
  // e a tela não faz outra coisa.
  { rota: '/dashboard/unidades', rotulo: 'Unidades', icone: 'store', perfis: ['ADMIN'], grupo: 'operacao' },

  // A área do aluno. Única que ele alcança, e nenhum outro perfil a vê:
  // ela mostra as fichas de quem está autenticado, e para a recepção e o
  // professor isso seria uma tela vazia — eles consultam a ficha do aluno
  // pela tela de Alunos.
  { rota: '/dashboard/meu-treino', rotulo: 'Meu treino', icone: 'fitness_center', perfis: ['ALUNO'] },
];

export function areasDoPerfil(perfil: TipoPerfil | null | undefined): Area[] {
  if (!perfil) return [];
  return AREAS.filter((area) => area.perfis.includes(perfil));
}

export function podeAcessar(rota: string, perfil: TipoPerfil | null | undefined): boolean {
  if (!perfil) return false;
  const area = AREAS.find((a) => a.rota === rota);
  // Rota sem área declarada não se libera por omissão: o padrão é negar.
  return area ? area.perfis.includes(perfil) : false;
}

/**
 * Para onde mandar o perfil ao entrar.
 *
 * Nem todo perfil tem visão geral — e `null` significa que ele não tem
 * área nenhuma, caso que o chamador precisa tratar em vez de navegar
 * para um lugar que vai recusá-lo de volta.
 */
export function rotaInicial(perfil: TipoPerfil | null | undefined): string | null {
  return areasDoPerfil(perfil)[0]?.rota ?? null;
}

/**
 * Uma ação dentro de uma tela, quando ela exige mais que a tela.
 *
 * Alcançar a tela não é poder tudo nela: a secretaria opera a loja mas
 * não mexe na tabela de preços, o professor abre chamado mas não cadastra
 * aparelho. Sem isto, a tela oferece botões que a API recusa — o mesmo
 * defeito do menu, uma camada abaixo.
 *
 * Agrupadas por conjunto de permissão, não por rota: "gerenciar produto"
 * cobre cadastrar, editar, dar entrada e tirar de linha, que são a mesma
 * autorização na API.
 */
export type Acao =
  | 'cadastrar-aluno'
  | 'gerenciar-aluno'
  | 'gerenciar-equipamento'
  | 'resolver-chamado'
  | 'gerenciar-produto'
  | 'gerenciar-plano'
  | 'cancelar-matricula';

const ACOES: Readonly<Record<Acao, readonly TipoPerfil[]>> = {
  // Cadastrar aluno é só da secretaria — nem a administração faz. O
  // cadastro acompanha a matrícula, e quem recebe o aluno no balcão é
  // quem tem os documentos na mão.
  'cadastrar-aluno': ['SECRETARIA'],
  // Editar dados e ativar/inativar seguem com as duas: corrigir um
  // telefone errado ou destravar um acesso não é matricular ninguém.
  'gerenciar-aluno': BALCAO,
  // Cadastro do aparelho e baixa do reparo são da administração; abrir
  // chamado, não — é quem está no salão que vê o aparelho quebrar.
  'gerenciar-equipamento': ['ADMIN'],
  'resolver-chamado': ['ADMIN'],
  // Tabela de preços e estoque são da administração; vender é do balcão.
  'gerenciar-produto': ['ADMIN'],
  'gerenciar-plano': ['ADMIN'],
  // Cancelar é irreversível: o aluno precisa ser matriculado de novo.
  'cancelar-matricula': ['ADMIN'],
};

export function podeExecutar(acao: Acao, perfil: TipoPerfil | null | undefined): boolean {
  return perfil ? ACOES[acao].includes(perfil) : false;
}
