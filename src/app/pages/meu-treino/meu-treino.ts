import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

import { Exercicio, Treino, descreverPrescricao } from '../../core/models';
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
}
