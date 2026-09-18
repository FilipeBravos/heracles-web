import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

import { Exercicio, HistoricoTreino, Treino, descreverPeriodo, descreverPrescricao } from '../../core/models';
import { AuthService } from '../../core/services/auth.service';
import { MinhaAreaService } from '../../core/services/minha-area.service';
import { mensagemDeErro } from '../../core/services/erro-api';

/**
 * A área do aluno.
 *
 * É a única tela que ele alcança, e o uso real é no salão, no celular,
 * entre uma série e outra — daí a ficha aberta de uma vez, sem
 * acordeão, e a prescrição em destaque ao lado de cada exercício.
 */
@Component({
  selector: 'app-meu-treino',
  standalone: true,
  imports: [MatButtonModule, MatIconModule, MatProgressSpinnerModule],
  templateUrl: './meu-treino.html',
})
export class MeuTreinoComponent implements OnInit {
  private readonly minhaArea = inject(MinhaAreaService);
  private readonly auth = inject(AuthService);

  readonly carregando = signal(true);
  readonly erro = signal<string | null>(null);
  readonly fichas = signal<Treino[]>([]);

  /** Índice da ficha aberta. Com uma só, não há o que escolher. */
  readonly selecionada = signal(0);

  readonly primeiroNome = computed(
    () => this.auth.usuario()?.nome.trim().split(/\s+/)[0] ?? ''
  );

  readonly fichaAberta = computed<Treino | null>(
    () => this.fichas()[this.selecionada()] ?? null
  );

  readonly prescricao = descreverPrescricao;
  readonly periodo = descreverPeriodo;

  /** Fechado por padrão: quem abre a tela no meio da série quer a ficha, não a lista de fichas antigas. */
  readonly historicoAberto = signal(false);
  readonly carregandoHistorico = signal(false);
  readonly erroHistorico = signal<string | null>(null);
  readonly historico = signal<HistoricoTreino[]>([]);
  private historicoCarregado = false;

  ngOnInit(): void {
    this.carregar();
  }

  carregar(): void {
    this.carregando.set(true);
    this.erro.set(null);

    this.minhaArea.meusTreinos().subscribe({
      next: (fichas) => {
        this.fichas.set(fichas);
        this.selecionada.set(this.primeiraComExercicios(fichas));
        this.carregando.set(false);
      },
      error: (erro) => {
        this.erro.set(mensagemDeErro(erro, 'Não foi possível carregar seu treino.'));
        this.carregando.set(false);
      },
    });
  }

  /**
   * Abre na primeira ficha que tem exercícios.
   *
   * A ordem vem alfabética da API, e uma ficha ainda vazia pode cair em
   * primeiro — abrir nela mostraria "sem exercícios" a quem tem treino
   * montado ao lado. Se nenhuma tiver, a primeira serve.
   */
  private primeiraComExercicios(fichas: Treino[]): number {
    const indice = fichas.findIndex((ficha) => ficha.exercicios.length > 0);
    return indice >= 0 ? indice : 0;
  }

  /**
   * Séries × repetições mínimas da ficha, como a API calcula.
   *
   * Uma ficha recém-criada pode não ter exercício nenhum ainda; nesse
   * caso o número seria zero e não diz nada, então nem aparece.
   */
  mostraVolume(ficha: Treino): boolean {
    return ficha.volumePrescritoMinimo > 0;
  }

  /** As duas linhas de apoio do exercício, quando existem. */
  detalhes(exercicio: Exercicio): string[] {
    return [exercicio.carga, exercicio.observacoes].filter(
      (texto): texto is string => !!texto && texto.trim().length > 0
    );
  }

  /**
   * Abre ou fecha a lista de fichas anteriores, carregando na primeira vez.
   *
   * Não entra em `carregar()`: é informação secundária, e pedi-la de
   * saída atrasaria a ficha de hoje — a que importa para quem abriu a
   * tela no meio de uma série — atrás de uma consulta que a maioria das
   * vezes ninguém vai olhar.
   */
  alternarHistorico(): void {
    this.historicoAberto.set(!this.historicoAberto());
    if (this.historicoAberto() && !this.historicoCarregado) {
      this.carregarHistorico();
    }
  }

  recarregarHistorico(): void {
    this.carregarHistorico();
  }

  private carregarHistorico(): void {
    this.carregandoHistorico.set(true);
    this.erroHistorico.set(null);

    this.minhaArea.historicoDeTreinos().subscribe({
      next: (historico) => {
        this.historico.set(historico);
        this.historicoCarregado = true;
        this.carregandoHistorico.set(false);
      },
      error: (erro) => {
        this.erroHistorico.set(mensagemDeErro(erro, 'Não foi possível carregar seu histórico.'));
        this.carregandoHistorico.set(false);
      },
    });
  }
}
