import {
  Assinatura,
  descreverPrazo,
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
