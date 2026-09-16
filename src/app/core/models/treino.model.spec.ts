import { descreverPrescricao } from './treino.model';

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
