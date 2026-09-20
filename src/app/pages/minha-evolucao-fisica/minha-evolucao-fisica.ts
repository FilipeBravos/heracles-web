import { Component, OnDestroy, OnInit, inject, signal } from '@angular/core';
import { DatePipe } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

import { AvaliacaoFisica, ComparativoFisico } from '../../core/models';
import { MinhaAreaService } from '../../core/services/minha-area.service';
import { mensagemDeErro } from '../../core/services/erro-api';

/**
 * A evolução física como o aluno a vê: peso, medidas e fotos ao longo do
 * tempo, registradas pelo professor nas avaliações periódicas.
 *
 * Só leitura — quem mede e fotografa é o professor, presencialmente, com
 * fita métrica e balança de verdade. O aluno acompanha, não lança dados.
 */
@Component({
  selector: 'app-minha-evolucao-fisica',
  standalone: true,
  imports: [DatePipe, MatIconModule, MatProgressSpinnerModule],
  templateUrl: './minha-evolucao-fisica.html',
})
export class MinhaEvolucaoFisicaComponent implements OnInit, OnDestroy {
  private readonly minhaArea = inject(MinhaAreaService);

  readonly carregando = signal(true);
  readonly erro = signal<string | null>(null);
  readonly historico = signal<AvaliacaoFisica[]>([]);
  readonly comparativo = signal<ComparativoFisico | null>(null);

  /** Object URLs das fotos já buscadas, por "avaliacaoId:fotoId". */
  readonly fotoPorChave = signal<Record<string, string>>({});

  ngOnInit(): void {
    this.carregar();
  }

  ngOnDestroy(): void {
    for (const url of Object.values(this.fotoPorChave())) {
      URL.revokeObjectURL(url);
    }
  }

  carregar(): void {
    this.carregando.set(true);
    this.erro.set(null);

    this.minhaArea.minhasAvaliacoesFisicas().subscribe({
      next: (historico) => {
        this.historico.set(historico);
        this.carregando.set(false);
        this.carregarFotos(historico);
      },
      error: (erro) => {
        this.erro.set(mensagemDeErro(erro, 'Não foi possível carregar sua evolução física.'));
        this.carregando.set(false);
      },
    });

    this.minhaArea.meuComparativoFisico().subscribe({
      next: (comparativo) => this.comparativo.set(comparativo),
      // Sem comparativo não impede o resto da tela de aparecer.
      error: () => {},
    });
  }

  private carregarFotos(historico: AvaliacaoFisica[]): void {
    for (const avaliacao of historico) {
      for (const fotoId of avaliacao.fotoIds) {
        this.minhaArea.minhaFotoAvaliacaoFisica(avaliacao.id, fotoId).subscribe({
          next: (blob) => {
            const url = URL.createObjectURL(blob);
            this.fotoPorChave.update((atual) => ({ ...atual, [`${avaliacao.id}:${fotoId}`]: url }));
          },
          error: () => {},
        });
      }
    }
  }

  fotoUrl(avaliacaoId: number, fotoId: number): string | null {
    return this.fotoPorChave()[`${avaliacaoId}:${fotoId}`] ?? null;
  }

  primeiraFotoUrl(avaliacao: AvaliacaoFisica | null): string | null {
    if (!avaliacao || avaliacao.fotoIds.length === 0) return null;
    return this.fotoUrl(avaliacao.id, avaliacao.fotoIds[0]);
  }

  /** "+2,5 kg" ou "-1,3 kg" — o sinal fala mais rápido que a cor aqui, e funciona em texto puro. */
  formatarDelta(valor: number | null, sufixo = ''): string {
    if (valor === null) return '—';
    const sinal = valor > 0 ? '+' : '';
    return `${sinal}${valor}${sufixo}`;
  }
}
