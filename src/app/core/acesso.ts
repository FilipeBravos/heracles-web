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
