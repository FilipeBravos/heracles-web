import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { CurrencyPipe, DatePipe } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

import {
  AvisoMatricula,
  MinhaMatricula,
  ORIGENS_ASSINATURA,
  TIPOS_COBRANCA,
  avisoDaMinhaMatricula,
} from '../../core/models';
import { MinhaAreaService } from '../../core/services/minha-area.service';
import { mensagemDeErro } from '../../core/services/erro-api';

/**
 * A matrícula como o aluno a vê.
 *
 * Existe para responder uma pergunta que antes só a recepção respondia:
 * meu acesso está em dia? Por isso a resposta vem primeiro, em uma frase,
 * e os dados do plano depois — quem abre a tela no caminho da academia
 * não quer ler uma tabela para descobrir se pode entrar.
 */
@Component({
  selector: 'app-minha-matricula',
  standalone: true,
  imports: [CurrencyPipe, DatePipe, MatIconModule, MatProgressSpinnerModule],
  templateUrl: './minha-matricula.html',
})
export class MinhaMatriculaComponent implements OnInit {
  private readonly minhaArea = inject(MinhaAreaService);

  readonly carregando = signal(true);
  readonly erro = signal<string | null>(null);
  readonly matricula = signal<MinhaMatricula | null>(null);

  readonly aviso = computed<AvisoMatricula | null>(() => {
    const minha = this.matricula();
    return minha ? avisoDaMinhaMatricula(minha) : null;
  });

  /** Classes da faixa de aviso por tom — o estado precisa ler antes do texto. */
  private readonly FAIXA: Readonly<Record<AvisoMatricula['tom'], string>> = {
    ok: 'border-ok-200 bg-ok-50 text-ok-700',
    alerta: 'border-alerta-200 bg-alerta-50 text-alerta-700',
    perigo: 'border-perigo-200 bg-perigo-50 text-perigo-700',
    neutro: 'border-linha-forte bg-fundo-2 text-tinta-2',
  };

  readonly classeDaFaixa = computed(() => {
    const aviso = this.aviso();
    return aviso ? this.FAIXA[aviso.tom] : this.FAIXA['neutro'];
  });

  ngOnInit(): void {
    this.carregar();
  }

  carregar(): void {
    this.carregando.set(true);
    this.erro.set(null);

    this.minhaArea.minhaMatricula().subscribe({
      next: (matricula) => {
        this.matricula.set(matricula);
        this.carregando.set(false);
      },
      error: (erro) => {
        this.erro.set(mensagemDeErro(erro, 'Não foi possível carregar sua matrícula.'));
        this.carregando.set(false);
      },
    });
  }

  /** "Mensal recorrente", "Pacote anual" — o código do enum não diz nada ao aluno. */
  rotuloCobranca(matricula: MinhaMatricula): string {
    return TIPOS_COBRANCA.find((t) => t.valor === matricula.tipoCobranca)?.rotulo ?? '';
  }

  /**
   * De onde a matrícula veio.
   *
   * Vale mostrar porque muda a quem o aluno recorre: quem entrou por
   * Gympass renova no aplicativo do parceiro, não na recepção.
   */
  rotuloOrigem(matricula: MinhaMatricula): string {
    return ORIGENS_ASSINATURA.find((o) => o.valor === matricula.origem)?.rotulo ?? '';
  }
}
