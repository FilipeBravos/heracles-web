import { Component, OnInit, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSelectModule } from '@angular/material/select';

import { Equipamento, Unidade } from '../../../core/models';
import { EquipamentoService } from '../../../core/services/equipamento.service';
import { UnidadeService } from '../../../core/services/unidade.service';
import { mensagemDeErro } from '../../../core/services/erro-api';

export interface EquipamentoFormData {
  equipamento: Equipamento | null;
}

@Component({
  selector: 'app-equipamento-form',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
  ],
  templateUrl: './equipamento-form.html',
})
export class EquipamentoFormComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly equipamentoService = inject(EquipamentoService);
  private readonly unidadeService = inject(UnidadeService);

  readonly dialogRef = inject(MatDialogRef<EquipamentoFormComponent>);
  readonly data = inject<EquipamentoFormData>(MAT_DIALOG_DATA);

  readonly equipamento = this.data?.equipamento ?? null;
  readonly isEditMode = this.equipamento !== null;
  readonly enviando = signal(false);
  readonly carregandoUnidades = signal(true);
  readonly erro = signal<string | null>(null);
  readonly unidades = signal<Unidade[]>([]);

  readonly form = this.fb.nonNullable.group({
    unidadeId: [this.equipamento?.unidadeId ?? null as number | null, Validators.required],
    nome: [this.equipamento?.nome ?? '', [Validators.required, Validators.maxLength(100)]],
    intervaloDiasManutencao: [this.equipamento?.intervaloDiasManutencao ?? null as number | null,
      [Validators.min(1), Validators.max(3650)]],
  });

  ngOnInit(): void {
    this.unidadeService.listar().subscribe({
      next: (unidades) => {
        this.unidades.set(unidades);
        // Rede com uma unidade só: pré-seleciona, para não obrigar a
        // escolher o óbvio a cada cadastro.
        if (!this.isEditMode && unidades.length === 1) {
          this.form.patchValue({ unidadeId: unidades[0].id });
        }
        this.carregandoUnidades.set(false);
      },
      error: (erro) => {
        this.erro.set(mensagemDeErro(erro, 'Não foi possível carregar as unidades.'));
        this.carregandoUnidades.set(false);
      },
    });
  }

  salvar(): void {
    if (this.form.invalid || this.enviando()) {
      this.form.markAllAsTouched();
      return;
    }

    this.enviando.set(true);
    this.erro.set(null);

    const valores = this.form.getRawValue();
    const payload = {
      unidadeId: valores.unidadeId!,
      nome: valores.nome.trim(),
      intervaloDiasManutencao: valores.intervaloDiasManutencao != null ? Number(valores.intervaloDiasManutencao) : null,
    };

    const requisicao = this.equipamento
      ? this.equipamentoService.atualizar(this.equipamento.id, payload)
      : this.equipamentoService.criar(payload);

    requisicao.subscribe({
      next: () => this.dialogRef.close(true),
      error: (erro) => {
        this.enviando.set(false);
        this.erro.set(mensagemDeErro(erro, 'Não foi possível salvar o equipamento.'));
      },
    });
  }
}
