import { descreverPeriodo, descreverPrescricao } from './treino.model';

describe('descreverPrescricao', () => {
  it('escreve faixa quando o máximo é maior que o mínimo', () => {
    expect(descreverPrescricao({ series: 4, repeticoesMin: 10, repeticoesMax: 12 })).toBe('4x10 a 12');
  });

  it('escreve valor único quando a prescrição é exata', () => {
    expect(descreverPrescricao({ series: 3, repeticoesMin: 12, repeticoesMax: 12 })).toBe('3x12');
  });

  it('trata série única', () => {
    expect(descreverPrescricao({ series: 1, repeticoesMin: 1, repeticoesMax: 1 })).toBe('1x1');
  });
});

describe('descreverPeriodo', () => {
  it('mostra mês e ano abreviados nas duas pontas', () => {
    expect(descreverPeriodo({ vinculadoEm: '2026-03-01', desvinculadoEm: '2026-06-15' }))
      .toBe('de mar/26 a jun/26');
  });

  it('marca a virada de ano nos dois lados, não só em quem mudou', () => {
    // "de dez a jan" leria como o mesmo ano se o ano não aparecesse dos dois lados.
    expect(descreverPeriodo({ vinculadoEm: '2025-12-10', desvinculadoEm: '2026-01-20' }))
      .toBe('de dez/25 a jan/26');
  });
});
