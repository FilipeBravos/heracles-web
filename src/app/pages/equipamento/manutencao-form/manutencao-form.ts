import { Component, Inject, OnInit, inject, signal } from '@angular/core'; // 🌟 Adicionado OnInit
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { EquipamentoService, LancamentoManutencao, Equipamento } from '../../../core/services/equipamento.service';
import { HttpErrorResponse } from '@angular/common/http';

@Component({
  selector: 'app-manutencao-form',
  standalone: true,
  imports: [CommonModule, FormsModule, MatDialogModule, MatButtonModule, MatInputModule, MatIconModule],
  templateUrl: './manutencao-form.html'
})
export class ManutencaoFormComponent implements OnInit {
  private dialogRef = inject(MatDialogRef<ManutencaoFormComponent>);
  private equipamentoService = inject(EquipamentoService);
  
  // Injeta os dados passados para o modal
  public data = inject(MAT_DIALOG_DATA);

  public isEdicao = signal<boolean>(false);
  public equipamento!: Equipamento;
  private manutencaoId?: number;

  public manutencao: LancamentoManutencao = {
    data: new Date().toISOString().substring(0, 10),
    descricao: '',
    valor: 0
  };

  ngOnInit() {
    if (this.data) {
      if (this.data.manutencao) {
        this.equipamento = this.data.equipamento;
        this.manutencaoId = this.data.manutencao.id;
        this.manutencao = {
          data: this.data.manutencao.dataManutencao,
          descricao: this.data.manutencao.descricao,
          valor: this.data.manutencao.valor
        };
        this.isEdicao.set(true);
      } else {
        this.equipamento = this.data;
      }
    }
  }

  salvar() {
    if (!this.manutencao.descricao || this.manutencao.valor <= 0 || !this.manutencao.data) {
      alert('Por favor, preencha todos os campos obrigatórios.');
      return;
    }

    if (this.isEdicao()) {
      this.equipamentoService.atualizarManutencao(this.manutencaoId!, this.manutencao).subscribe({
        next: () => this.dialogRef.close(true),
        error: (err: HttpErrorResponse) => console.error('Erro ao editar manutenção', err)
      });
    } else {
      this.equipamentoService.registrarManutencao(this.equipamento.id!, this.manutencao).subscribe({
        next: () => this.dialogRef.close(true),
        error: (err: HttpErrorResponse) => console.error('Erro ao registrar manutenção', err)
      });
    }
  }

  fechar() {
    this.dialogRef.close(false);
  }
}