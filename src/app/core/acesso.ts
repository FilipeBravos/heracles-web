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
  /**
   * Separa a faixa "Operação" no menu, ou põe o item no fim, sozinho e
   * sem rótulo ("conta") — usado por quem é sobre a própria conta, não
   * sobre a unidade, e por isso não cabe na faixa de operação mesmo
   * quando o perfil tem uma.
   */
  readonly grupo?: 'operacao' | 'conta';
}

const TODOS_OPERACIONAIS: readonly TipoPerfil[] = ['ADMIN', 'SECRETARIA', 'PROFESSOR'];
const TODOS_OS_PERFIS: readonly TipoPerfil[] = ['ADMIN', 'SECRETARIA', 'PROFESSOR', 'ALUNO'];
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
  { rota: '/dashboard/agenda', rotulo: 'Agenda', icone: 'schedule', perfis: TODOS_OPERACIONAIS, grupo: 'operacao' },
  // Cadastro de unidade é estrutura da rede: só a administração escreve,
  // e a tela não faz outra coisa.
  { rota: '/dashboard/unidades', rotulo: 'Unidades', icone: 'store', perfis: ['ADMIN'], grupo: 'operacao' },

  // A área do aluno: as duas telas mostram o que é dele, e nenhum outro
  // perfil as vê — para a recepção e o professor seriam telas vazias, já
  // que eles consultam ficha e matrícula de aluno por Alunos e
  // Matrículas.
  { rota: '/dashboard/meu-treino', rotulo: 'Meu treino', icone: 'fitness_center', perfis: ['ALUNO'] },
  // Separada do treino porque responde outra pergunta — "posso entrar
  // hoje?" —, e ele precisa dela sem depender da recepção.
  { rota: '/dashboard/minha-matricula', rotulo: 'Minha matrícula', icone: 'card_membership', perfis: ['ALUNO'] },
  // Aulas em grupo são self-service; personal é só leitura aqui — quem
  // agenda continua sendo o balcão, a pedido do aluno.
  { rota: '/dashboard/minhas-aulas', rotulo: 'Minhas aulas', icone: 'schedule', perfis: ['ALUNO'] },
  // Só leitura: quem mede e fotografa é o professor, presencialmente.
  { rota: '/dashboard/minha-evolucao-fisica', rotulo: 'Minha evolução física', icone: 'show_chart', perfis: ['ALUNO'] },

  // Conta do próprio usuário — nome, telefone, senha, tema —, não
  // trabalho de aluno ou de matrícula: todo perfil a alcança, o aluno
  // inclusive. `grupo: 'conta'` a separa das duas faixas de cima — não
  // é "Operação" nem uma área exclusiva de um perfil — e a mantém
  // sempre no fim do menu, perto do cartão de usuário.
  { rota: '/dashboard/configuracoes', rotulo: 'Configurações', icone: 'settings', perfis: TODOS_OS_PERFIS, grupo: 'conta' },
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
  | 'gerenciar-anamnese'
  | 'gerenciar-avaliacao-fisica'
  | 'ver-contrato'
  | 'gerenciar-aula-grupo'
  | 'marcar-vaga-aula'
  | 'gerenciar-personal'
  | 'gerenciar-horario-professor'
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
  // Quem monta a ficha (professor) precisa poder ler e preencher a
  // anamnese também, não só a secretaria e a administração — é a mesma
  // regra que a API aplica em PUT /usuarios/*/anamnese.
  'gerenciar-anamnese': TODOS_OPERACIONAIS,
  // Registrar avaliação física é de quem monta o treino a partir dela —
  // administração e professor. A secretaria lê o histórico junto com o
  // resto da ficha (a tela de Alunos alcança todo operacional), mas não
  // registra: pesar e medir não é trabalho de balcão.
  'gerenciar-avaliacao-fisica': ['ADMIN', 'PROFESSOR'],
  // Contrato assinado é documento administrativo/legal — mesma regra da
  // API: admin e secretaria, não o professor.
  'ver-contrato': BALCAO,
  // Quem monta a agenda de aulas em grupo é o mesmo grupo que monta a
  // ficha de treino — professor e administração.
  'gerenciar-aula-grupo': ['ADMIN', 'PROFESSOR'],
  // Marcar/desmarcar vaga em nome de outro aluno é do balcão — o próprio
  // aluno reserva pela área dele, sem passar por aqui.
  'marcar-vaga-aula': BALCAO,
  // Personal nunca é self-service: quem agenda é sempre o balcão, a
  // pedido do aluno.
  'gerenciar-personal': BALCAO,
  // Horário de professor é estrutura de escala, como cadastro de
  // unidade — só a administração escreve.
  'gerenciar-horario-professor': ['ADMIN'],
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
