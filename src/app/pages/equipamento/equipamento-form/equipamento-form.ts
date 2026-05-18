import { Component, OnInit, inject, signal } from '@angular/core'; // 🌟 Adicionado OnInit
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog'; // 🌟 Adicionado MAT_DIALOG_DATA
import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { EquipamentoService, Equipamento } from '../../../core/services/equipamento.service';
import { HttpErrorResponse } from '@angular/common/http';

@Component({
  selector: 'app-equipamento-form',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatDialogModule,
    MatButtonModule,
    MatInputModule,
    MatIconModule
  ],
  templateUrl: './equipamento-form.html'
})
export class EquipamentoFormComponent implements OnInit {
  private dialogRef = inject(MatDialogRef<EquipamentoFormComponent>);
  private equipamentoService = inject(EquipamentoService);
  
  private data = inject(MAT_DIALOG_DATA, { optional: true });

  public isEdicao = signal<boolean>(false);

  public novoEquipamento: Equipamento = {
    marca: '',
    modelo: '',
    quantidade: 1,
    totalManutencoes: 0,
    totalGastoManutencao: 0
  };

  ngOnInit() {
    if (this.data && this.data.equipamento) {
      this.novoEquipamento = { ...this.data.equipamento };
      this.isEdicao.set(true);
    }
  }

  salvar() {
    if (!this.novoEquipamento.marca || !this.novoEquipamento.modelo || this.novoEquipamento.quantidade < 1) {
      alert('Por favor, preencha todos os campos obrigatórios.');
      return;
    }

    if (this.isEdicao()) {
      this.equipamentoService.atualizar(this.novoEquipamento.id!, this.novoEquipamento).subscribe({
        next: () => this.dialogRef.close(true),
        error: (err: HttpErrorResponse) => console.error('Erro ao editar ativo', err)
      });
    } else {
      this.equipamentoService.salvar(this.novoEquipamento).subscribe({
        next: () => this.dialogRef.close(true),
        error: (err: HttpErrorResponse) => console.error('Erro ao cadastrar ativo', err)
      });
    }
  }

  fechar() {
    this.dialogRef.close(false);
  }
}