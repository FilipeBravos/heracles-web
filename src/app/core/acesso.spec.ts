import { AREAS, areasDoPerfil, podeAcessar, rotaInicial } from './acesso';
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
