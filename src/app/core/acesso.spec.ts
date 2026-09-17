import { AREAS, Acao, areasDoPerfil, podeAcessar, podeExecutar, rotaInicial } from './acesso';
import { TipoPerfil } from './models';

describe('tabela de acesso', () => {
  it('dá ao admin todas as áreas', () => {
    expect(areasDoPerfil('ADMIN').length).toBe(AREAS.length);
  });

  it('não dá área nenhuma ao aluno', () => {
    // O sistema ainda não tem tela de aluno. Enquanto não tiver, é isto
    // que impede ele de entrar e receber 403 em cada tela.
    expect(areasDoPerfil('ALUNO')).toEqual([]);
    expect(rotaInicial('ALUNO')).toBeNull();
  });

  it('esconde da secretaria a prescrição de treino, e do professor o balcão', () => {
    const secretaria = areasDoPerfil('SECRETARIA').map((a) => a.rota);
    expect(secretaria).not.toContain('/dashboard/treinos');
    expect(secretaria).toContain('/dashboard/matriculas');

    const professor = areasDoPerfil('PROFESSOR').map((a) => a.rota);
    expect(professor).toContain('/dashboard/treinos');
    expect(professor).not.toContain('/dashboard/matriculas');
    expect(professor).not.toContain('/dashboard/loja');
  });

  it('deixa cadastro de unidade só com a administração', () => {
    for (const perfil of ['SECRETARIA', 'PROFESSOR', 'ALUNO'] as TipoPerfil[]) {
      expect(podeAcessar('/dashboard/unidades', perfil)).toBeFalse();
    }
    expect(podeAcessar('/dashboard/unidades', 'ADMIN')).toBeTrue();
  });

  it('nega rota sem área declarada, em vez de liberar por omissão', () => {
    expect(podeAcessar('/dashboard/relatorios', 'ADMIN')).toBeFalse();
  });

  it('nega quem não tem perfil', () => {
    expect(podeAcessar('/dashboard', null)).toBeFalse();
    expect(areasDoPerfil(undefined)).toEqual([]);
  });

  it('a rota inicial de cada perfil é uma área que ele alcança', () => {
    for (const perfil of ['ADMIN', 'SECRETARIA', 'PROFESSOR'] as TipoPerfil[]) {
      const inicial = rotaInicial(perfil);
      expect(inicial).not.toBeNull();
      expect(podeAcessar(inicial!, perfil)).toBeTrue();
    }
  });
});

describe('ações dentro da tela', () => {
  it('alcançar a tela não é poder tudo nela', () => {
    // O professor alcança Equipamentos para abrir chamado, mas cadastrar
    // aparelho e dar baixa no reparo são da administração.
    expect(podeAcessar('/dashboard/equipamentos', 'PROFESSOR')).toBeTrue();
    expect(podeExecutar('gerenciar-equipamento', 'PROFESSOR')).toBeFalse();
    expect(podeExecutar('resolver-chamado', 'PROFESSOR')).toBeFalse();

    // A secretaria opera a loja, mas não mexe na tabela de preços.
    expect(podeAcessar('/dashboard/loja', 'SECRETARIA')).toBeTrue();
    expect(podeExecutar('gerenciar-produto', 'SECRETARIA')).toBeFalse();

    // E alcança Matrículas, mas não cadastra plano nem cancela.
    expect(podeAcessar('/dashboard/matriculas', 'SECRETARIA')).toBeTrue();
    expect(podeExecutar('gerenciar-plano', 'SECRETARIA')).toBeFalse();
    expect(podeExecutar('cancelar-matricula', 'SECRETARIA')).toBeFalse();
  });

  it('o professor consulta aluno e vincula ficha, mas não cadastra', () => {
    expect(podeAcessar('/dashboard/alunos', 'PROFESSOR')).toBeTrue();
    expect(podeExecutar('gerenciar-aluno', 'PROFESSOR')).toBeFalse();
    expect(podeExecutar('gerenciar-aluno', 'SECRETARIA')).toBeTrue();
  });

  it('o admin executa todas as ações', () => {
    const acoes: Acao[] = [
      'gerenciar-aluno', 'gerenciar-equipamento', 'resolver-chamado',
      'gerenciar-produto', 'gerenciar-plano', 'cancelar-matricula',
    ];
    for (const acao of acoes) expect(podeExecutar(acao, 'ADMIN')).toBeTrue();
  });

  it('nega quem não tem perfil', () => {
    expect(podeExecutar('gerenciar-aluno', null)).toBeFalse();
    expect(podeExecutar('gerenciar-produto', undefined)).toBeFalse();
  });
});
