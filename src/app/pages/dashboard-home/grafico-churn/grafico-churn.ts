import { Component, computed, input, signal } from '@angular/core';

import {
  HistoricoChurn,
  PontoChurn,
  descreverMes,
  escalaDoGrafico,
  rotularAno,
  rotularMes,
} from '../../../core/models';

interface Coluna {
  ponto: PontoChurn;
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
  /** "5,5%" — já formatado, sem casas decimais quando a taxa é redonda. */
  rotuloTaxa: string;
}

/**
 * Taxa de churn por mês, como porcentagem.
 *
 * Cor própria (vermelho/perigo), não o bronze da marca: aqui a barra mais
 * alta é a pior notícia, não a melhor — usar a mesma cor do gráfico de
 * matrículas confundiria "crescendo" com "perdendo aluno". `alerta-700`
 * foi cogitado primeiro, mas no tema claro ele é quase idêntico ao
 * `bronze-700` (ambos um âmbar escuro) — os dois gráficos ficariam
 * visualmente iguais lado a lado, então o `perigo-700` (vermelho) venceu.
 *
 * Mesmo padrão do gráfico de matrículas: colunas (taxa de um mês fechado
 * não é ponto de uma curva contínua), rótulo direto só no pior mês e no
 * atual, tabela como alternativa acessível.
 */
@Component({
  selector: 'app-grafico-churn',
  standalone: true,
  imports: [],
  templateUrl: './grafico-churn.html',
})
export class GraficoChurnComponent {
  readonly historico = input.required<HistoricoChurn>();

  /** Alterna entre o gráfico e a mesma série como tabela. */
  readonly mostrandoTabela = signal(false);

  /** Coluna sob o ponteiro ou com foco do teclado. */
  readonly ativa = signal<number | null>(null);

  private readonly taxasEmPorcentagem = computed(() =>
    this.historico().pontos.map((p) => p.taxaChurn * 100)
  );

  readonly escala = computed(() => escalaDoGrafico(this.taxasEmPorcentagem()));

  readonly colunas = computed<Coluna[]>(() => {
    const pontos = this.historico().pontos;
    const maximo = this.escala().maximo;
    const taxas = this.taxasEmPorcentagem();
    const maiorTaxa = Math.max(0, ...taxas);
    const ultimoIndice = pontos.length - 1;

    return pontos.map((ponto, i) => {
      const taxaPct = taxas[i];
      return {
        ponto,
        altura: maximo > 0 ? (taxaPct / maximo) * 100 : 0,
        rotulo: rotularMes(ponto.mes),
        rotuloCurto: `${rotularMes(ponto.mes)}/${rotularAno(ponto.mes)}`,
        ano: i === 0 || ponto.mes.endsWith('-01') ? rotularAno(ponto.mes) : null,
        descricao: `${descreverMes(ponto.mes)}: taxa de churn de ${this.formatarTaxa(taxaPct)}, `
          + `${ponto.cancelados} cancelamento(s) sobre ${ponto.ativosNoInicio} ativos no início do mês`,
        destacada: ponto.ativosNoInicio > 0 && (i === ultimoIndice || taxaPct === maiorTaxa),
        rotuloTaxa: this.formatarTaxa(taxaPct),
      };
    });
  });

  /** Marcas do eixo de cima para baixo, que é a ordem em que se desenham. */
  readonly marcasDoEixo = computed(() => [...this.escala().marcas].reverse());

  readonly resumoAcessivel = computed(() => {
    const h = this.historico();
    return `Taxa de churn por mês nos últimos ${h.meses} meses.`;
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

  rotuloMarca(marca: number): string {
    return `${marca}%`;
  }

  private formatarTaxa(taxaPct: number): string {
    // Uma casa decimal só quando ela muda o número — "5%" lê melhor que
    // "5,0%", mas "5,5%" perderia informação real se arredondado.
    const arredondada = Math.round(taxaPct * 10) / 10;
    const texto = Number.isInteger(arredondada) ? arredondada.toString() : arredondada.toFixed(1).replace('.', ',');
    return `${texto}%`;
  }
}
