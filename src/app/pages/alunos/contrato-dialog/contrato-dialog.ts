import { Component, OnInit, inject, signal } from '@angular/core';
import { DatePipe } from '@angular/common';
import { MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

import { Contrato, Usuario } from '../../../core/models';
import { UsuarioService } from '../../../core/services/usuario.service';
import { mensagemDeErro } from '../../../core/services/erro-api';

export interface ContratoDialogData {
  aluno: Usuario;
}

/**
 * O contrato assinado no cadastro — só leitura, não há edição: o que foi
 * assinado não se reescreve.
 */
@Component({
  selector: 'app-contrato-dialog',
  standalone: true,
  imports: [MatDialogModule, MatButtonModule, MatIconModule, MatProgressSpinnerModule, DatePipe],
  templateUrl: './contrato-dialog.html',
})
export class ContratoDialogComponent implements OnInit {
  private readonly usuarioService = inject(UsuarioService);

  readonly data = inject<ContratoDialogData>(MAT_DIALOG_DATA);

  readonly carregando = signal(true);
  readonly erro = signal<string | null>(null);
  readonly contrato = signal<Contrato | null>(null);

  ngOnInit(): void {
    this.usuarioService.buscarContrato(this.data.aluno.id).subscribe({
      next: (contrato) => {
        this.contrato.set(contrato);
        this.carregando.set(false);
      },
      error: (erro) => {
        this.erro.set(mensagemDeErro(erro, 'Não foi possível carregar o contrato.'));
        this.carregando.set(false);
      },
    });
  }
}
