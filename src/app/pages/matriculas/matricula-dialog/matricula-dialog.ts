import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { CurrencyPipe, DatePipe } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSelectModule } from '@angular/material/select';

import {
  FORMAS_PAGAMENTO,
  FormaPagamento,
  ORIGENS_ASSINATURA,
  OrigemAssinatura,
  Plano,
  Usuario,
} from '../../../core/models';
import { AssinaturaService } from '../../../core/services/assinatura.service';
import { PlanoService } from '../../../core/services/plano.service';
import { UsuarioService } from '../../../core/services/usuario.service';
import { mensagemDeErro } from '../../../core/services/erro-api';

/**
 * Hoje em yyyy-MM-dd no fuso local.
 *
 * É o formato que o input nativo de data e a API usam. toISOString daria
 * UTC e podia recuar um dia.
 */
function hojeEmIso(): string {
  const agora = new Date();
  const mes = `${agora.getMonth() + 1}`.padStart(2, '0');
  const dia = `${agora.getDate()}`.padStart(2, '0');
  return `${agora.getFullYear()}-${mes}-${dia}`;
}

@Component({
  selector: 'app-matricula-dialog',
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
    CurrencyPipe,
    DatePipe,
  ],
  templateUrl: './matricula-dialog.html',
})
export class MatriculaDialogComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly assinaturaService = inject(AssinaturaService);
  private readonly planoService = inject(PlanoService);
  private readonly usuarioService = inject(UsuarioService);

  readonly dialogRef = inject(MatDialogRef<MatriculaDialogComponent>);
  readonly origens = ORIGENS_ASSINATURA;
  readonly formasPagamento = FORMAS_PAGAMENTO;

  readonly carregando = signal(true);
  readonly enviando = signal(false);
  readonly erro = signal<string | null>(null);

  readonly alunos = signal<Usuario[]>([]);
  readonly planos = signal<Plano[]>([]);

  readonly form = this.fb.nonNullable.group({
    alunoId: [null as number | null, Validators.required],
    planoId: [null as number | null, Validators.required],
    origem: ['DIRETO' as OrigemAssinatura, Validators.required],
    tokenParceiro: [''],
    indicadoPorAlunoId: [null as number | null],
    formaPagamento: ['PIX' as FormaPagamento, Validators.required],
    // Input nativo de data: o valor ja chega como yyyy-MM-dd, o mesmo
    // formato que a API espera. O datepicker do Material custaria ~130 kB
    // no chunk desta tela por um campo que quase sempre fica no padrao.
    dataInicio: [hojeEmIso()],
  });

  /** O valor atual do formulário, como signal, para o resumo reagir. */
  private readonly valores = signal(this.form.getRawValue());

  readonly planoEscolhido = computed(
    () => this.planos().find((p) => p.id === this.valores().planoId) ?? null
  );

  readonly exigeToken = computed(() => this.valores().origem === 'GYMPASS' || this.valores().origem === 'TOTALPASS');
  readonly exigeIndicador = computed(() => this.valores().origem === 'INDICACAO');

  /** O próprio aluno não aparece na lista de quem pode tê-lo indicado. */
  readonly alunosParaIndicar = computed(() =>
    this.alunos().filter((a) => a.id !== this.valores().alunoId)
  );

  /** A data de início como Date, para sair pelo pipe em pt-BR. */
  readonly inicioEscolhido = computed(() => {
    const inicio = this.valores().dataInicio;
    if (!inicio) return null;
    const data = new Date(`${inicio}T00:00:00`);
    return Number.isNaN(data.getTime()) ? null : data;
  });

  /**
   * Vencimento previsto, para conferência do operador.
   *
   * Quem calcula de fato é a API, a partir do período do plano — este
   * número serve para o operador ver, antes de confirmar, se está
   * vendendo um mês ou um ano.
   */
  readonly vencimentoPrevisto = computed(() => {
    const plano = this.planoEscolhido();
    const inicio = this.inicioEscolhido();
    if (!plano || !inicio) return null;

    const meses = plano.tipoCobranca === 'PACOTE_ANUAL' ? 12 : 1;
    const data = new Date(inicio);
    data.setMonth(data.getMonth() + meses);
    return data;
  });

  ngOnInit(): void {
    this.form.valueChanges.subscribe(() => {
      this.valores.set(this.form.getRawValue());
      this.ajustarToken();
      this.ajustarIndicador();
    });

    Promise.all([
      new Promise<void>((ok, falha) => this.usuarioService.listar(0, 200).subscribe({
        next: (p) => { this.alunos.set(p.content.filter((u) => u.tipoPerfil === 'ALUNO')); ok(); },
        error: falha,
      })),
      // Só planos em oferta: matricular num plano fora de linha é
      // recusado pela API, e oferecê-lo aqui seria um beco.
      new Promise<void>((ok, falha) => this.planoService.listar(0, 200, true).subscribe({
        next: (p) => { this.planos.set(p.content); ok(); },
        error: falha,
      })),
    ]).then(
      () => this.carregando.set(false),
      (erro) => {
        this.erro.set(mensagemDeErro(erro, 'Não foi possível carregar alunos e planos.'));
        this.carregando.set(false);
      }
    );
  }

  /** Token é obrigatório no parceiro e não existe na matrícula direta. */
  private ajustarToken(): void {
    const controle = this.form.controls.tokenParceiro;
    const precisa = this.exigeToken();

    if (precisa && !controle.hasValidator(Validators.required)) {
      controle.addValidators(Validators.required);
      controle.updateValueAndValidity({ emitEvent: false });
    } else if (!precisa && controle.hasValidator(Validators.required)) {
      controle.removeValidators(Validators.required);
      controle.setValue('', { emitEvent: false });
      controle.updateValueAndValidity({ emitEvent: false });
    }
  }

  /** Quem indicou é obrigatório na indicação e não existe nas demais origens. */
  private ajustarIndicador(): void {
    const controle = this.form.controls.indicadoPorAlunoId;
    const precisa = this.exigeIndicador();

    if (precisa && !controle.hasValidator(Validators.required)) {
      controle.addValidators(Validators.required);
      controle.updateValueAndValidity({ emitEvent: false });
    } else if (!precisa && controle.hasValidator(Validators.required)) {
      controle.removeValidators(Validators.required);
      controle.setValue(null, { emitEvent: false });
      controle.updateValueAndValidity({ emitEvent: false });
    }
  }

  matricular(): void {
    if (this.form.invalid || this.enviando()) {
      this.form.markAllAsTouched();
      return;
    }

    this.enviando.set(true);
    this.erro.set(null);

    const valores = this.form.getRawValue();
    const token = valores.tokenParceiro.trim();

    this.assinaturaService.matricular({
      alunoId: valores.alunoId!,
      planoId: valores.planoId!,
      origem: valores.origem,
      tokenParceiro: this.exigeToken() ? token : null,
      indicadoPorAlunoId: this.exigeIndicador() ? valores.indicadoPorAlunoId : null,
      dataInicio: valores.dataInicio || null,
      formaPagamento: valores.formaPagamento,
    }).subscribe({
      next: (assinatura) => this.dialogRef.close(assinatura),
      error: (erro) => {
        this.enviando.set(false);
        this.erro.set(mensagemDeErro(erro, 'Não foi possível matricular o aluno.'));
      },
    });
  }

  unidadesDoPlano(plano: Plano): string {
    return plano.unidades.map((u) => u.nome).join(', ') || '—';
  }

}
