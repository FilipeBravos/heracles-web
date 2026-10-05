import { Component, computed, input, signal } from '@angular/core';

import { OcupacaoPorUnidade, PontoOcupacao, escalaDoGrafico, rotularHora } from '../../../core/models';

interface Coluna {
  ponto: PontoOcupacao;
  /** Altura da barra como fração do eixo, em porcentagem. */
  altura: number;
  /** Só a cada 3 horas — um rótulo por barra lotaria o eixo. */
  rotulo: string;
  descricao: string;
  /** Recebe rótulo direto: só o(s) horário(s) de pico. */
  destacada: boolean;
}

/**
 * Ocupação por hora do dia, numa unidade: em que horário a casa costuma
 * lotar, pra dimensionar equipamento e horário de aula em grupo.
 *
 * Mesmo padrão dos outros gráficos do painel — colunas, rótulo direto só
 * no pico, tabela como alternativa acessível. Cor bronze (não vermelha):
 * pico de ocupação não é má notícia como churn, é só um dado operacional.
 */
@Component({
  selector: 'app-grafico-ocupacao',
  standalone: true,
  imports: [],
  templateUrl: './grafico-ocupacao.html',
})
export class GraficoOcupacaoComponent {
  readonly unidade = input.required<OcupacaoPorUnidade>();
  readonly dias = input.required<number>();

  /** Alterna entre o gráfico e a mesma série como tabela. */
  readonly mostrandoTabela = signal(false);

  /** Coluna sob o ponteiro ou com foco do teclado. */
  readonly ativa = signal<number | null>(null);

  readonly escala = computed(() =>
    escalaDoGrafico(this.unidade().pontos.map((p) => p.quantidade))
  );

  readonly total = computed(() =>
    this.unidade().pontos.reduce((soma, p) => soma + p.quantidade, 0)
  );

  readonly colunas = computed<Coluna[]>(() => {
    const pontos = this.unidade().pontos;
    const maximo = this.escala().maximo;
    const maior = Math.max(0, ...pontos.map((p) => p.quantidade));

    return pontos.map((ponto) => ({
      ponto,
      altura: maximo > 0 ? (ponto.quantidade / maximo) * 100 : 0,
      // A cada 3h (0h, 3h, 6h...): um rótulo por hora lotaria o eixo de 24 colunas.
      rotulo: ponto.hora % 3 === 0 ? rotularHora(ponto.hora) : '',
      descricao: `${rotularHora(ponto.hora)}: ${ponto.quantidade} ${
        ponto.quantidade === 1 ? 'check-in' : 'check-ins'
      }`,
      destacada: ponto.quantidade > 0 && ponto.quantidade === maior,
    }));
  });

  /** Marcas do eixo de cima para baixo, que é a ordem em que se desenham. */
  readonly marcasDoEixo = computed(() => [...this.escala().marcas].reverse());

  readonly resumoAcessivel = computed(() => {
    const u = this.unidade();
    return `Ocupação por hora do dia em ${u.unidadeNome}, últimos ${this.dias()} dias, `
      + `${this.total()} check-in(s) liberado(s) no total.`;
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
