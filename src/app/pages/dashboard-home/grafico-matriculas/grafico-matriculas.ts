import { Component, computed, input, signal } from '@angular/core';

import {
  HistoricoMensal,
  PontoMensal,
  descreverMes,
  escalaDoGrafico,
  rotularAno,
  rotularMes,
} from '../../../core/models';

interface Coluna {
  ponto: PontoMensal;
  /** Altura da barra como fração do eixo, em porcentagem. */
  altura: number;
  rotulo: string;
  /** "jan/26" — o rótulo do tooltip e da tabela. */
  rotuloCurto: string;
  /** Só na primeira coluna e em cada janeiro: ancora a virada do ano. */
  ano: string | null;
  descricao: string;
  /** Recebe rótulo direto: o maior do período e o mês atual. */
  destacada: boolean;
}

/**
 * Matrículas por mês.
 *
 * Colunas e não linha: cada mês é uma contagem fechada, e a linha ligando
 * os pontos sugeriria valores intermediários que não existem.
 *
 * Uma série só, então uma cor só (o bronze da marca) e nenhuma legenda —
 * o título já diz o que está plotado. O rótulo direto vai só no maior do
 * período e no mês atual: número em cima de toda barra vira ruído e
 * ninguém lê.
 */
@Component({
  selector: 'app-grafico-matriculas',
  standalone: true,
  imports: [],
  templateUrl: './grafico-matriculas.html',
})
export class GraficoMatriculasComponent {
  readonly historico = input.required<HistoricoMensal>();

  /** Alterna entre o gráfico e a mesma série como tabela. */
  readonly mostrandoTabela = signal(false);

  /** Coluna sob o ponteiro ou com foco do teclado. */
  readonly ativa = signal<number | null>(null);

  readonly escala = computed(() =>
    escalaDoGrafico(this.historico().pontos.map((p) => p.quantidade))
  );

  readonly colunas = computed<Coluna[]>(() => {
    const pontos = this.historico().pontos;
    const maximo = this.escala().maximo;
    const maior = Math.max(0, ...pontos.map((p) => p.quantidade));
    const ultimoIndice = pontos.length - 1;

    return pontos.map((ponto, i) => ({
      ponto,
      altura: maximo > 0 ? (ponto.quantidade / maximo) * 100 : 0,
      rotulo: rotularMes(ponto.mes),
      rotuloCurto: `${rotularMes(ponto.mes)}/${rotularAno(ponto.mes)}`,
      // O ano aparece na primeira coluna e em cada janeiro: repetir em
      // todas polui o eixo, e omitir de vez tira a âncora do período.
      ano: i === 0 || ponto.mes.endsWith('-01') ? rotularAno(ponto.mes) : null,
      descricao: `${descreverMes(ponto.mes)}: ${ponto.quantidade} ${
        ponto.quantidade === 1 ? 'matrícula' : 'matrículas'
      }`,
      destacada:
        ponto.quantidade > 0 && (i === ultimoIndice || ponto.quantidade === maior),
    }));
  });

  /** Marcas do eixo de cima para baixo, que é a ordem em que se desenham. */
  readonly marcasDoEixo = computed(() => [...this.escala().marcas].reverse());

  readonly resumoAcessivel = computed(() => {
    const h = this.historico();
    return `Matrículas por mês nos últimos ${h.meses} meses, ${h.total} no total.`;
  });

  /**
   * De que lado o tooltip se ancora.
   *
   * Centralizado ele vazaria do cartão nas colunas das pontas — e um
   * tooltip cortado pela borda é pior que nenhum.
   */
  ancoragem(indice: number): 'esquerda' | 'centro' | 'direita' {
    const ultimo = this.colunas().length - 1;
    if (indice <= 1) return 'esquerda';
    if (indice >= ultimo - 1) return 'direita';
    return 'centro';
  }

  posicaoDaMarca(marca: number): number {
    const maximo = this.escala().maximo;
    return maximo > 0 ? 100 - (marca / maximo) * 100 : 100;
  }
}
