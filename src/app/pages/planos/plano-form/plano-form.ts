import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { HttpErrorResponse } from '@angular/common/http';

import { PlanoService, Plano } from '../../../core/services/plano.service';

@Component({
  selector: 'app-plano-form',
  standalone: true,
  imports: [CommonModule, FormsModule, MatDialogModule, MatButtonModule, MatInputModule, MatIconModule],
  templateUrl: './plano-form.html'
})
export class PlanoFormComponent implements OnInit {
  private dialogRef = inject(MatDialogRef<PlanoFormComponent>);
  private planoService = inject(PlanoService);

  private data = inject(MAT_DIALOG_DATA, { optional: true });

  public isEdicao = signal<boolean>(false);

  public novoPlano: Plano = {
    nome: '',
    duracaoMeses: 1,
    valor: 0
  };

  ngOnInit() {
    if (this.data && this.data.plano) {
      this.novoPlano = { ...this.data.plano };
      this.isEdicao.set(true);
    }
  }

  salvar() {
    if (!this.novoPlano.nome || this.novoPlano.duracaoMeses < 1 || this.novoPlano.valor <= 0) {
      alert('Preencha os campos obrigatórios corretamente.');
      return;
    }

    if (this.isEdicao()) {
      this.planoService.atualizarPlano(this.novoPlano.id!, this.novoPlano).subscribe({
        next: () => this.dialogRef.close(true),
        error: (err: HttpErrorResponse) => console.error('Erro ao editar plano', err)
      });
    } else {
      this.planoService.salvarPlano(this.novoPlano).subscribe({
        next: () => this.dialogRef.close(true),
        error: (err: HttpErrorResponse) => console.error('Erro ao cadastrar plano', err)
      });
    }
  }

  fechar() {
    this.dialogRef.close(false);
  }
}