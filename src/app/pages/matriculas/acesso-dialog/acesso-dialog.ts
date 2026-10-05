import { Component, OnInit, inject, signal } from '@angular/core';
import { CurrencyPipe, DatePipe } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSelectModule } from '@angular/material/select';

import { Acesso, Unidade, Usuario } from '../../../core/models';
import { AssinaturaService } from '../../../core/services/assinatura.service';
import { UnidadeService } from '../../../core/services/unidade.service';
import { UsuarioService } from '../../../core/services/usuario.service';
import { mensagemDeErro } from '../../../core/services/erro-api';

/**
 * A pergunta da catraca: este aluno pode treinar nesta unidade hoje?
 *
 * O veredito vem com o motivo porque cada um leva a um encaminhamento
 * diferente no balcão — atraso é cobrança, vencimento é renovação, plano
 * que não cobre a unidade é conversa de troca de plano.
 */
@Component({
  selector: 'app-acesso-dialog',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatSelectModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    CurrencyPipe,
    DatePipe,
  ],
  templateUrl: './acesso-dialog.html',
})
export class AcessoDialogComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly assinaturaService = inject(AssinaturaService);
  private readonly usuarioService = inject(UsuarioService);
  private readonly unidadeService = inject(UnidadeService);

  readonly dialogRef = inject(MatDialogRef<AcessoDialogComponent>);

  readonly carregando = signal(true);
  readonly conferindo = signal(false);
  readonly erro = signal<string | null>(null);

  readonly alunos = signal<Usuario[]>([]);
  readonly unidades = signal<Unidade[]>([]);
  readonly resultado = signal<Acesso | null>(null);

  readonly form = this.fb.nonNullable.group({
    alunoId: [null as number | null, Validators.required],
    unidadeId: [null as number | null, Validators.required],
  });

  ngOnInit(): void {
    // Trocar de aluno ou de unidade invalida o veredito anterior: deixá-lo
    // na tela é o caminho para liberar a catraca pela resposta errada.
    this.form.valueChanges.subscribe(() => this.resultado.set(null));

    Promise.all([
      new Promise<void>((ok, falha) => this.usuarioService.listar(0, 200).subscribe({
        next: (p) => { this.alunos.set(p.content.filter((u) => u.tipoPerfil === 'ALUNO')); ok(); },
        error: falha,
      })),
      new Promise<void>((ok, falha) => this.unidadeService.listar().subscribe({
        next: (u) => {
          this.unidades.set(u);
          if (u.length === 1) this.form.patchValue({ unidadeId: u[0].id });
          ok();
        },
        error: falha,
      })),
    ]).then(
      () => this.carregando.set(false),
      (erro) => {
        this.erro.set(mensagemDeErro(erro, 'Não foi possível carregar alunos e unidades.'));
        this.carregando.set(false);
      }
    );
  }

  conferir(): void {
    if (this.form.invalid || this.conferindo()) {
      this.form.markAllAsTouched();
      return;
    }

    this.conferindo.set(true);
    this.erro.set(null);
    this.resultado.set(null);

    const { alunoId, unidadeId } = this.form.getRawValue();

    this.assinaturaService.conferirAcesso(alunoId!, unidadeId!).subscribe({
      next: (acesso) => {
        this.resultado.set(acesso);
        this.conferindo.set(false);
      },
      error: (erro) => {
        this.conferindo.set(false);
        this.erro.set(mensagemDeErro(erro, 'Não foi possível conferir o acesso.'));
      },
    });
  }

  /** O que fazer no balcão diante de cada motivo. */
  encaminhamento(acesso: Acesso): string | null {
    return {
      LIBERADO: null,
      SEM_MATRICULA: 'Matricule o aluno em um plano para liberar o acesso.',
      INADIMPLENTE: 'Receba o pagamento e renove a matrícula — o acesso volta na hora.',
      VENCIDA: 'Renove a matrícula: o novo período conta a partir de hoje.',
      UNIDADE_NAO_COBERTA: 'O plano atual não cobre esta unidade. Ofereça a troca por um plano de rede.',
    }[acesso.motivo];
  }
}
