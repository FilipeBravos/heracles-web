import { AREAS, Acao, areasDoPerfil, podeAcessar, podeExecutar, rotaInicial } from './acesso';
import { TipoPerfil } from './models';

describe('tabela de acesso', () => {
  const AREAS_DO_ALUNO = ['/dashboard/meu-treino', '/dashboard/minha-matricula'];

  it('dá ao admin todas as áreas operacionais', () => {
    // Todas menos as do aluno, que são da conta de quem está autenticado.
    expect(areasDoPerfil('ADMIN').length).toBe(AREAS.length - AREAS_DO_ALUNO.length);
  });

  it('dá ao aluno as suas áreas, e só elas', () => {
    expect(areasDoPerfil('ALUNO').map((a) => a.rota)).toEqual(AREAS_DO_ALUNO);
    // Ele cai no treino ao entrar: é o que ele abre todo dia.
    expect(rotaInicial('ALUNO')).toBe('/dashboard/meu-treino');
  });

  it('as áreas do aluno não aparecem para os perfis operacionais', () => {
    // Elas mostram a ficha e a matrícula de quem está autenticado: para a
    // recepção e o professor seriam telas vazias. Eles consultam as do
    // aluno por Alunos e Matrículas.
    for (const rota of AREAS_DO_ALUNO) {
      for (const perfil of ['ADMIN', 'SECRETARIA', 'PROFESSOR'] as TipoPerfil[]) {
        expect(podeAcessar(rota, perfil)).toBeFalse();
      }
      expect(podeAcessar(rota, 'ALUNO')).toBeTrue();
    }
  });

  it('sem perfil não há rota inicial — é o laço que o guard precisa evitar', () => {
    expect(rotaInicial(null)).toBeNull();
    expect(rotaInicial(undefined)).toBeNull();
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

  it('deixa configurações só com a administração, nem o aluno vê a própria conta por lá', () => {
    for (const perfil of ['SECRETARIA', 'PROFESSOR', 'ALUNO'] as TipoPerfil[]) {
      expect(podeAcessar('/dashboard/configuracoes', perfil)).toBeFalse();
    }
    expect(podeAcessar('/dashboard/configuracoes', 'ADMIN')).toBeTrue();
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
    expect(podeExecutar('cadastrar-aluno', 'PROFESSOR')).toBeFalse();
  });

  it('cadastrar aluno é só da secretaria — nem o admin faz', () => {
    // Matricular é da recepção: o cadastro acompanha a matrícula, e quem
    // recebe o aluno no balcão é quem tem os documentos na mão.
    expect(podeExecutar('cadastrar-aluno', 'SECRETARIA')).toBeTrue();
    expect(podeExecutar('cadastrar-aluno', 'ADMIN')).toBeFalse();
  });

  it('editar e inativar aluno seguem com as duas', () => {
    // Corrigir um telefone errado ou destravar um acesso não é matricular.
    for (const perfil of ['ADMIN', 'SECRETARIA'] as TipoPerfil[]) {
      expect(podeExecutar('gerenciar-aluno', perfil)).toBeTrue();
    }
  });

  it('o admin executa todas as ações menos cadastrar aluno', () => {
    const acoes: Acao[] = [
      'gerenciar-aluno', 'gerenciar-equipamento', 'resolver-chamado',
      'gerenciar-produto', 'gerenciar-plano', 'cancelar-matricula',
    ];
    for (const acao of acoes) expect(podeExecutar(acao, 'ADMIN')).toBeTrue();
    expect(podeExecutar('cadastrar-aluno', 'ADMIN')).toBeFalse();
  });

  it('nega quem não tem perfil', () => {
    expect(podeExecutar('gerenciar-aluno', null)).toBeFalse();
    expect(podeExecutar('gerenciar-produto', undefined)).toBeFalse();
  });
});
