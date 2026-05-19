import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { HttpErrorResponse } from '@angular/common/http';

import { SuplementoService, Suplemento } from '../../../core/services/suplemento.service';

@Component({
  selector: 'app-suplemento-form',
  standalone: true,
  imports: [CommonModule, FormsModule, MatDialogModule, MatButtonModule, MatInputModule, MatIconModule],
  templateUrl: './suplemento-form.html'
})
export class SuplementoFormComponent implements OnInit {
  private dialogRef = inject(MatDialogRef<SuplementoFormComponent>);
  private suplementoService = inject(SuplementoService);
  
  private data = inject(MAT_DIALOG_DATA, { optional: true });

  public isEdicao = signal<boolean>(false);

  public novoSuplemento: Suplemento = {
    nome: '',
    marca: '',
    quantidadeEstoque: 0,
    preco: 0
  };

  ngOnInit() {
    if (this.data && this.data.produto) {
      this.novoSuplemento = { ...this.data.produto };
      this.isEdicao.set(true);
    }
  }

  salvar() {
    if (!this.novoSuplemento.nome || !this.novoSuplemento.marca || this.novoSuplemento.preco <= 0) {
      alert('Preencha os campos obrigatórios e garanta que o preço seja maior que zero.');
      return;
    }

    if (this.isEdicao()) {
      this.suplementoService.atualizar(this.novoSuplemento.id!, this.novoSuplemento).subscribe({
        next: () => this.dialogRef.close(true),
        error: (err: HttpErrorResponse) => console.error('Erro ao editar suplemento', err)
      });
    } else {
      this.suplementoService.salvar(this.novoSuplemento).subscribe({
        next: () => this.dialogRef.close(true),
        error: (err: HttpErrorResponse) => console.error('Erro ao cadastrar suplemento', err)
      });
    }
  }

  fechar() {
    this.dialogRef.close(false);
  }
}