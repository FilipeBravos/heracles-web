import {
  Assinatura,
  descreverMes,
  descreverPrazo,
  escalaDoGrafico,
  rotularAno,
  rotularMes,
  situacaoDaMatricula,
  urgenciaDoPrazo,
} from './matricula.model';

function assinatura(parcial: Partial<Assinatura>): Assinatura {
  return {
    id: 1,
    alunoId: 1,
    alunoNome: 'Marina Alves',
    planoId: 1,
    planoNome: 'Mensal Centro',
    valorMensal: 129.9,
    origem: 'DIRETO',
    tokenParceiro: null,
    dataInicio: '2026-08-15',
    dataVencimento: '2026-09-15',
    status: 'ATIVA',
    dataCancelamento: null,
    vencida: false,
    ...parcial,
  };
}

describe('situacaoDaMatricula', () => {
  const hoje = '2026-09-15';

  it('lê como em dia quando o vencimento ainda está longe', () => {
    expect(situacaoDaMatricula(assinatura({ dataVencimento: '2026-10-15' }), hoje)).toBe('EM_DIA');
  });

  it('separa "vence em breve" de "em dia" dentro da janela de cobrança', () => {
    // Sete dias ainda entram na fila da semana; oito, não.
    expect(situacaoDaMatricula(assinatura({ dataVencimento: '2026-09-22' }), hoje)).toBe('VENCE_EM_BREVE');
    expect(situacaoDaMatricula(assinatura({ dataVencimento: '2026-09-23' }), hoje)).toBe('EM_DIA');
  });

  it('no próprio dia do vencimento ainda não está vencida', () => {
    // A API marca `vencida` só depois da data — o aluno pagou por este dia.
    expect(situacaoDaMatricula(assinatura({ dataVencimento: hoje }), hoje)).toBe('VENCE_EM_BREVE');
  });

  it('inadimplente vence a leitura de data', () => {
    // A secretaria já marcou por falta de pagamento: é isso que o balcão
    // precisa ver, não "vence em breve".
    const emAtraso = assinatura({ status: 'INADIMPLENTE', dataVencimento: '2026-09-18' });
    expect(situacaoDaMatricula(emAtraso, hoje)).toBe('INADIMPLENTE');
  });

  it('cancelada vence tudo, inclusive vencimento passado', () => {
    const cancelada = assinatura({
      status: 'CANCELADA',
      vencida: true,
      dataVencimento: '2026-08-01',
      dataCancelamento: '2026-08-20',
    });
    expect(situacaoDaMatricula(cancelada, hoje)).toBe('CANCELADA');
  });

  it('usa o sinal `vencida` da API, não o próprio cálculo', () => {
    expect(situacaoDaMatricula(assinatura({ vencida: true, dataVencimento: '2026-09-10' }), hoje))
      .toBe('VENCIDA');
  });
});

describe('descreverPrazo', () => {
  it('distingue atraso de prazo com palavras, não só com o sinal', () => {
    expect(descreverPrazo(-3)).toBe('venceu há 3 dias');
    expect(descreverPrazo(3)).toBe('vence em 3 dias');
  });

  it('usa ontem, hoje e amanhã no lugar de "1 dia"', () => {
    expect(descreverPrazo(-1)).toBe('venceu ontem');
    expect(descreverPrazo(0)).toBe('vence hoje');
    expect(descreverPrazo(1)).toBe('vence amanhã');
  });
});

describe('urgenciaDoPrazo', () => {
  it('separa vencido, próximo e distante na janela de cobrança', () => {
    expect(urgenciaDoPrazo(-1)).toBe('vencido');
    expect(urgenciaDoPrazo(0)).toBe('proximo');
    expect(urgenciaDoPrazo(7)).toBe('proximo');
    expect(urgenciaDoPrazo(8)).toBe('distante');
  });
});

describe('escalaDoGrafico', () => {
  it('sobe o topo até um número redondo em vez de parar no maior valor', () => {
    // Uma barra que encosta no topo tira a referência de quanto falta.
    expect(escalaDoGrafico([5, 8, 3, 12, 11]).maximo).toBe(15);
    expect(escalaDoGrafico([5, 8, 3, 12, 11]).marcas).toEqual([0, 5, 10, 15]);
  });

  it('usa passo pequeno em série pequena', () => {
    expect(escalaDoGrafico([1, 2, 3]).marcas).toEqual([0, 1, 2, 3]);
  });

  it('acompanha a ordem de grandeza', () => {
    expect(escalaDoGrafico([120, 340, 90]).maximo).toBe(400);
    expect(escalaDoGrafico([1200, 3400]).maximo).toBe(4000);
  });

  it('série toda zerada ainda tem eixo', () => {
    // Sem eixo o painel pareceria quebrado, em vez de vazio.
    expect(escalaDoGrafico([0, 0, 0])).toEqual({ maximo: 4, marcas: [0, 2, 4] });
    expect(escalaDoGrafico([])).toEqual({ maximo: 4, marcas: [0, 2, 4] });
  });
});

describe('rótulos de mês', () => {
  it('abrevia sem ponto e sem depender do locale do navegador', () => {
    expect(rotularMes('2026-09')).toBe('set');
    expect(rotularMes('2025-10')).toBe('out');
    expect(rotularAno('2025-10')).toBe('25');
  });

  it('descreve por extenso para leitor de tela e tooltip', () => {
    expect(descreverMes('2026-03')).toBe('março de 2026');
  });
});
