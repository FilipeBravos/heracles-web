import { Component, OnDestroy, OnInit, inject, signal } from '@angular/core';
import { DatePipe } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

import { AvaliacaoFisica, ComparativoFisico, FotoAvaliacaoForm, Usuario } from '../../../core/models';
import { AuthService } from '../../../core/services/auth.service';
import { UsuarioService } from '../../../core/services/usuario.service';
import { mensagemDeErro } from '../../../core/services/erro-api';
import { podeExecutar } from '../../../core/acesso';

export interface AvaliacaoFisicaDialogData {
  aluno: Usuario;
}

const TAMANHO_MAXIMO_FOTO_BYTES = 3 * 1024 * 1024;
const TIPOS_DE_FOTO_ACEITOS = ['image/jpeg', 'image/png', 'image/webp'];
const MAXIMO_DE_FOTOS = 6;

/**
 * Avaliação física periódica — complementar à anamnese, que é só o
 * intake inicial. Não há edição: cada visita gera uma linha nova, e a
 * evolução está em comparar uma com a anterior, não em reescrever o
 * passado.
 */
@Component({
  selector: 'app-avaliacao-fisica-dialog',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    DatePipe,
  ],
  templateUrl: './avaliacao-fisica-dialog.html',
})
export class AvaliacaoFisicaDialogComponent implements OnInit, OnDestroy {
  private readonly fb = inject(FormBuilder);
  private readonly usuarioService = inject(UsuarioService);
  private readonly auth = inject(AuthService);

  readonly data = inject<AvaliacaoFisicaDialogData>(MAT_DIALOG_DATA);

  readonly podeRegistrar = podeExecutar('gerenciar-avaliacao-fisica', this.auth.usuario()?.tipoPerfil);
  readonly maximoDeFotos = MAXIMO_DE_FOTOS;

  readonly carregando = signal(true);
  readonly enviando = signal(false);
  readonly erro = signal<string | null>(null);
  readonly erroFoto = signal<string | null>(null);
  readonly historico = signal<AvaliacaoFisica[]>([]);
  readonly mostrarFormulario = signal(false);

  readonly comparativo = signal<ComparativoFisico | null>(null);
  readonly mostrarComparativo = signal(false);

  /** Object URLs das fotos já buscadas, por "avaliacaoId:fotoId". */
  readonly fotoPorChave = signal<Record<string, string>>({});

  readonly novasFotosPreviewUrls = signal<string[]>([]);
  private novasFotos: FotoAvaliacaoForm[] = [];

  readonly form = this.fb.nonNullable.group({
    pesoKg: [null as number | null, [Validators.required, Validators.min(1)]],
    alturaCm: [null as number | null, [Validators.required, Validators.min(1)]],
    percentualGordura: [null as number | null, [Validators.min(0), Validators.max(100)]],
    circunferenciaCintura: [null as number | null],
    circunferenciaQuadril: [null as number | null],
    circunferenciaBraco: [null as number | null],
    circunferenciaCoxa: [null as number | null],
    circunferenciaPeito: [null as number | null],
    observacoes: ['', Validators.maxLength(1000)],
  });

  ngOnInit(): void {
    this.carregar();
  }

  ngOnDestroy(): void {
    for (const url of Object.values(this.fotoPorChave())) {
      URL.revokeObjectURL(url);
    }
    this.limparPreviewsNovasFotos();
  }

  private carregar(): void {
    this.carregando.set(true);
    this.erro.set(null);

    this.usuarioService.historicoAvaliacoesFisicas(this.data.aluno.id).subscribe({
      next: (historico) => {
        this.historico.set(historico);
        this.carregando.set(false);
        this.carregarFotos(historico);
      },
      error: (erro) => {
        this.erro.set(mensagemDeErro(erro, 'Não foi possível carregar o histórico de avaliações.'));
        this.carregando.set(false);
      },
    });

    this.usuarioService.compararAvaliacoesFisicas(this.data.aluno.id).subscribe({
      next: (comparativo) => this.comparativo.set(comparativo),
      // Sem comparativo não impede o resto da tela de aparecer.
      error: () => {},
    });
  }

  private carregarFotos(historico: AvaliacaoFisica[]): void {
    for (const avaliacao of historico) {
      for (const fotoId of avaliacao.fotoIds) {
        this.usuarioService.buscarFotoAvaliacaoFisica(this.data.aluno.id, avaliacao.id, fotoId).subscribe({
          next: (blob) => {
            const url = URL.createObjectURL(blob);
            this.fotoPorChave.update((atual) => ({ ...atual, [`${avaliacao.id}:${fotoId}`]: url }));
          },
          // Sem uma foto na lista não impede o resto do histórico de aparecer.
          error: () => {},
        });
      }
    }
  }

  fotoUrl(avaliacaoId: number, fotoId: number): string | null {
    return this.fotoPorChave()[`${avaliacaoId}:${fotoId}`] ?? null;
  }

  /** A primeira foto da avaliação, para o comparativo lado a lado. */
  primeiraFotoUrl(avaliacao: AvaliacaoFisica | null): string | null {
    if (!avaliacao || avaliacao.fotoIds.length === 0) return null;
    return this.fotoUrl(avaliacao.id, avaliacao.fotoIds[0]);
  }

  alternarComparativo(): void {
    this.mostrarComparativo.update((atual) => !atual);
  }

  /** "+2,5 kg" ou "-1,3 kg" — o sinal fala mais rápido que a cor aqui, e funciona em texto puro. */
  formatarDelta(valor: number | null, sufixo = ''): string {
    if (valor === null) return '—';
    const sinal = valor > 0 ? '+' : '';
    return `${sinal}${valor}${sufixo}`;
  }

  abrirFormulario(): void {
    this.mostrarFormulario.set(true);
  }

  cancelarFormulario(): void {
    this.mostrarFormulario.set(false);
    this.form.reset();
    this.limparPreviewsNovasFotos();
    this.erroFoto.set(null);
  }

  private limparPreviewsNovasFotos(): void {
    for (const url of this.novasFotosPreviewUrls()) {
      URL.revokeObjectURL(url);
    }
    this.novasFotosPreviewUrls.set([]);
    this.novasFotos = [];
  }

  aoSelecionarFotos(evento: Event): void {
    const input = evento.target as HTMLInputElement;
    const arquivos = Array.from(input.files ?? []);
    input.value = '';
    if (arquivos.length === 0) return;

    if (this.novasFotos.length + arquivos.length > this.maximoDeFotos) {
      this.erroFoto.set(`No máximo ${this.maximoDeFotos} fotos por avaliação.`);
      return;
    }

    for (const arquivo of arquivos) {
      if (!TIPOS_DE_FOTO_ACEITOS.includes(arquivo.type)) {
        this.erroFoto.set('As fotos precisam ser JPEG, PNG ou WebP.');
        continue;
      }
      if (arquivo.size > TAMANHO_MAXIMO_FOTO_BYTES) {
        this.erroFoto.set('Cada foto tem até 3 MB.');
        continue;
      }

      const leitor = new FileReader();
      leitor.onload = () => {
        const resultado = leitor.result as string;
        const separador = resultado.indexOf(',');
        this.novasFotos = [...this.novasFotos, { base64: resultado.slice(separador + 1), contentType: arquivo.type }];
        this.novasFotosPreviewUrls.update((atual) => [...atual, resultado]);
        this.erroFoto.set(null);
      };
      leitor.readAsDataURL(arquivo);
    }
  }

  removerNovaFoto(indice: number): void {
    this.novasFotos = this.novasFotos.filter((_, i) => i !== indice);
    this.novasFotosPreviewUrls.update((atual) => atual.filter((_, i) => i !== indice));
  }

  salvar(): void {
    if (this.form.invalid || this.enviando()) {
      this.form.markAllAsTouched();
      return;
    }

    this.enviando.set(true);
    this.erro.set(null);

    const valores = this.form.getRawValue();
    this.usuarioService
      .registrarAvaliacaoFisica(this.data.aluno.id, {
        data: null,
        pesoKg: valores.pesoKg!,
        alturaCm: valores.alturaCm!,
        percentualGordura: valores.percentualGordura,
        circunferenciaCintura: valores.circunferenciaCintura,
        circunferenciaQuadril: valores.circunferenciaQuadril,
        circunferenciaBraco: valores.circunferenciaBraco,
        circunferenciaCoxa: valores.circunferenciaCoxa,
        circunferenciaPeito: valores.circunferenciaPeito,
        observacoes: valores.observacoes.trim() || null,
        fotos: this.novasFotos,
      })
      .subscribe({
        next: () => {
          this.enviando.set(false);
          this.cancelarFormulario();
          this.carregar();
        },
        error: (erro) => {
          this.enviando.set(false);
          this.erro.set(mensagemDeErro(erro, 'Não foi possível registrar a avaliação.'));
        },
      });
  }
}
