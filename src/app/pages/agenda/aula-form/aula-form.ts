import { Component, OnInit, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSelectModule } from '@angular/material/select';

import { AulaGrupo, Unidade, Usuario } from '../../../core/models';
import { AgendaService } from '../../../core/services/agenda.service';
import { UnidadeService } from '../../../core/services/unidade.service';
import { UsuarioService } from '../../../core/services/usuario.service';
import { mensagemDeErro } from '../../../core/services/erro-api';

@Component({
  selector: 'app-aula-form',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatSelectModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
  ],
  templateUrl: './aula-form.html',
})
export class AulaFormComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly agendaService = inject(AgendaService);
  private readonly usuarioService = inject(UsuarioService);
  private readonly unidadeService = inject(UnidadeService);

  readonly dialogRef = inject(MatDialogRef<AulaFormComponent>);

  readonly carregando = signal(true);
  readonly enviando = signal(false);
  readonly erro = signal<string | null>(null);

  readonly professores = signal<Usuario[]>([]);
  readonly unidades = signal<Unidade[]>([]);

  readonly form = this.fb.nonNullable.group({
    nome: ['', [Validators.required, Validators.maxLength(100)]],
    professorId: [null as number | null, Validators.required],
    unidadeId: [null as number | null, Validators.required],
    dataHora: ['', Validators.required],
    duracaoMinutos: [50, [Validators.required, Validators.min(1)]],
    capacidadeMaxima: [15, [Validators.required, Validators.min(1)]],
  });

  ngOnInit(): void {
    Promise.all([
      new Promise<void>((ok, falha) => this.usuarioService.listar(0, 200).subscribe({
        next: (p) => { this.professores.set(p.content.filter((u) => u.tipoPerfil === 'PROFESSOR')); ok(); },
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
        this.erro.set(mensagemDeErro(erro, 'Não foi possível carregar professores e unidades.'));
        this.carregando.set(false);
      }
    );
  }

  salvar(): void {
    if (this.form.invalid || this.enviando()) {
      this.form.markAllAsTouched();
      return;
    }

    this.enviando.set(true);
    this.erro.set(null);

    const valores = this.form.getRawValue();
    this.agendaService
      .criarAula({
        nome: valores.nome,
        professorId: valores.professorId!,
        unidadeId: valores.unidadeId!,
        dataHora: valores.dataHora,
        duracaoMinutos: valores.duracaoMinutos,
        capacidadeMaxima: valores.capacidadeMaxima,
      })
      .subscribe({
        next: (aula: AulaGrupo) => this.dialogRef.close(aula),
        error: (erro) => {
          this.enviando.set(false);
          this.erro.set(mensagemDeErro(erro, 'Não foi possível criar a aula.'));
        },
      });
  }
}
