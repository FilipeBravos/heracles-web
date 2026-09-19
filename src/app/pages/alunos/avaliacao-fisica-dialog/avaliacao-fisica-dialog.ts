import { Component, OnDestroy, OnInit, inject, signal } from '@angular/core';
import { DatePipe } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

import { AvaliacaoFisica, Usuario } from '../../../core/models';
import { AuthService } from '../../../core/services/auth.service';
import { UsuarioService } from '../../../core/services/usuario.service';
import { mensagemDeErro } from '../../../core/services/erro-api';
import { podeExecutar } from '../../../core/acesso';

export interface AvaliacaoFisicaDialogData {
  aluno: Usuario;
}

const TAMANHO_MAXIMO_FOTO_BYTES = 3 * 1024 * 1024;
const TIPOS_DE_FOTO_ACEITOS = ['image/jpeg', 'image/png', 'image/webp'];

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

  readonly carregando = signal(true);
  readonly enviando = signal(false);
  readonly erro = signal<string | null>(null);
  readonly erroFoto = signal<string | null>(null);
  readonly historico = signal<AvaliacaoFisica[]>([]);
  readonly mostrarFormulario = signal(false);

  /** Object URLs das fotos já buscadas, por id de avaliação. */
  readonly fotoPorAvaliacao = signal<Record<number, string>>({});

  readonly fotoPreviewUrl = signal<string | null>(null);
  private novaFotoBase64: string | null = null;
  private novaFotoContentType: string | null = null;

  readonly form = this.fb.nonNullable.group({
    pesoKg: [null as number | null, [Validators.required, Validators.min(1)]],
    alturaCm: [null as number | null, [Validators.required, Validators.min(1)]],
    percentualGordura: [null as number | null, [Validators.min(0), Validators.max(100)]],
    circunferenciaCintura: [null as number | null],
    circunferenciaQuadril: [null as number | null],
    circunferenciaBraco: [null as number | null],
    circunferenciaCoxa: [null as number | null],
    observacoes: ['', Validators.maxLength(1000)],
  });

  ngOnInit(): void {
    this.carregar();
  }

  ngOnDestroy(): void {
    for (const url of Object.values(this.fotoPorAvaliacao())) {
      URL.revokeObjectURL(url);
    }
    if (this.fotoPreviewUrl()) {
      URL.revokeObjectURL(this.fotoPreviewUrl()!);
    }
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
  }

  private carregarFotos(historico: AvaliacaoFisica[]): void {
    for (const avaliacao of historico) {
      if (!avaliacao.temFoto) continue;
      this.usuarioService.buscarFotoAvaliacaoFisica(this.data.aluno.id, avaliacao.id).subscribe({
        next: (blob) => {
          const url = URL.createObjectURL(blob);
          this.fotoPorAvaliacao.update((atual) => ({ ...atual, [avaliacao.id]: url }));
        },
        // Sem foto na lista não impede o resto do histórico de aparecer.
        error: () => {},
      });
    }
  }

  abrirFormulario(): void {
    this.mostrarFormulario.set(true);
  }

  cancelarFormulario(): void {
    this.mostrarFormulario.set(false);
    this.form.reset();
    if (this.fotoPreviewUrl()) {
      URL.revokeObjectURL(this.fotoPreviewUrl()!);
    }
    this.fotoPreviewUrl.set(null);
    this.novaFotoBase64 = null;
    this.novaFotoContentType = null;
    this.erroFoto.set(null);
  }

  aoSelecionarFoto(evento: Event): void {
    const input = evento.target as HTMLInputElement;
    const arquivo = input.files?.[0];
    if (!arquivo) return;

    if (!TIPOS_DE_FOTO_ACEITOS.includes(arquivo.type)) {
      this.erroFoto.set('A foto precisa ser JPEG, PNG ou WebP.');
      input.value = '';
      return;
    }
    if (arquivo.size > TAMANHO_MAXIMO_FOTO_BYTES) {
      this.erroFoto.set('A foto excede o tamanho máximo de 3 MB.');
      input.value = '';
      return;
    }

    const leitor = new FileReader();
    leitor.onload = () => {
      const resultado = leitor.result as string;
      const separador = resultado.indexOf(',');
      this.novaFotoBase64 = resultado.slice(separador + 1);
      this.novaFotoContentType = arquivo.type;

      if (this.fotoPreviewUrl()) {
        URL.revokeObjectURL(this.fotoPreviewUrl()!);
      }
      this.fotoPreviewUrl.set(resultado);
      this.erroFoto.set(null);
    };
    leitor.readAsDataURL(arquivo);
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
        observacoes: valores.observacoes.trim() || null,
        fotoBase64: this.novaFotoBase64,
        fotoContentType: this.novaFotoContentType,
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
