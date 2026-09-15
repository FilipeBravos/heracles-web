import { Component, OnInit, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSelectModule } from '@angular/material/select';

import { Plano, TIPOS_COBRANCA, TipoCobranca, Unidade } from '../../../core/models';
import { PlanoService } from '../../../core/services/plano.service';
import { UnidadeService } from '../../../core/services/unidade.service';
import { mensagemDeErro } from '../../../core/services/erro-api';

export interface PlanoFormData {
  plano: Plano | null;
}

@Component({
  selector: 'app-plano-form',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatCheckboxModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
  ],
  templateUrl: './plano-form.html',
})
export class PlanoFormComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly planoService = inject(PlanoService);
  private readonly unidadeService = inject(UnidadeService);

  readonly dialogRef = inject(MatDialogRef<PlanoFormComponent>);
  readonly data = inject<PlanoFormData>(MAT_DIALOG_DATA);

  readonly plano = this.data?.plano ?? null;
  readonly isEditMode = this.plano !== null;
  readonly tiposCobranca = TIPOS_COBRANCA;

  readonly enviando = signal(false);
  readonly carregandoUnidades = signal(true);
  readonly erro = signal<string | null>(null);
  readonly unidades = signal<Unidade[]>([]);

  /** Seleção de unidades fora do form: checkbox múltiplo não é um controle. */
  readonly selecionadas = signal<Set<number>>(
    new Set(this.plano?.unidades.map((u) => u.id) ?? [])
  );

  readonly form = this.fb.nonNullable.group({
    nome: [this.plano?.nome ?? '', [Validators.required, Validators.maxLength(100)]],
    valorMensal: [this.plano?.valorMensal ?? null as number | null,
      [Validators.required, Validators.min(0.01)]],
    tipoCobranca: [this.plano?.tipoCobranca ?? 'RECORRENTE' as TipoCobranca, Validators.required],
  });

  ngOnInit(): void {
    this.unidadeService.listar().subscribe({
      next: (unidades) => {
        this.unidades.set(unidades);
        // Rede de uma unidade só: não há escolha a fazer.
        if (!this.isEditMode && unidades.length === 1) {
          this.selecionadas.set(new Set([unidades[0].id]));
        }
        this.carregandoUnidades.set(false);
      },
      error: (erro) => {
        this.erro.set(mensagemDeErro(erro, 'Não foi possível carregar as unidades.'));
        this.carregandoUnidades.set(false);
      },
    });
  }

  alternarUnidade(id: number): void {
    const proxima = new Set(this.selecionadas());
    proxima.has(id) ? proxima.delete(id) : proxima.add(id);
    this.selecionadas.set(proxima);
  }

  estaSelecionada(id: number): boolean {
    return this.selecionadas().has(id);
  }

  /**
   * Um plano sem unidade não dá acesso a lugar nenhum — o aluno pagaria
   * e não usaria. A API recusa; barrar aqui evita a ida e volta.
   */
  get semUnidade(): boolean {
    return this.selecionadas().size === 0;
  }

  salvar(): void {
    if (this.form.invalid || this.semUnidade || this.enviando()) {
      this.form.markAllAsTouched();
      return;
    }

    this.enviando.set(true);
    this.erro.set(null);

    const valores = this.form.getRawValue();
    const payload = {
      nome: valores.nome.trim(),
      valorMensal: Number(valores.valorMensal),
      tipoCobranca: valores.tipoCobranca,
      unidadeIds: [...this.selecionadas()],
    };

    const requisicao = this.plano
      ? this.planoService.atualizar(this.plano.id, payload)
      : this.planoService.criar(payload);

    requisicao.subscribe({
      next: () => this.dialogRef.close(true),
      error: (erro) => {
        this.enviando.set(false);
        this.erro.set(mensagemDeErro(erro, 'Não foi possível salvar o plano.'));
      },
    });
  }
}
