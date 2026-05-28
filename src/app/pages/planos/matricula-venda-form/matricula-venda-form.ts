import { Component, Inject, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatSelectModule } from '@angular/material/select';
import { MatIconModule } from '@angular/material/icon';
import { HttpErrorResponse } from '@angular/common/http';

import { PlanoService, Plano, MatriculaDTO } from '../../../core/services/plano.service';

@Component({
  selector: 'app-matricula-venda-form',
  standalone: true,
  imports: [
    CommonModule, 
    FormsModule, 
    MatDialogModule, 
    MatButtonModule, 
    MatSelectModule, 
    MatIconModule
  ],
  templateUrl: './matricula-venda-form.html'
})
export class MatriculaVendaFormComponent implements OnInit {
  private dialogRef = inject(MatDialogRef<MatriculaVendaFormComponent>);
  private planoService = inject(PlanoService);

  // 🌟 Recebe o Aluno Fixo que veio da tabela ou do cadastro
  constructor(@Inject(MAT_DIALOG_DATA) public data: { alunoFixo: any }) {}

  public planos = signal<Plano[]>([]);
  public selectedPlanoId = signal<number | null>(null);
  public dataInicio = signal<string>(new Date().toISOString().substring(0, 10));

  ngOnInit() {
    this.carregarPlanos();
  }

  carregarPlanos() {
    this.planoService.listarPlanos().subscribe({
      next: (res) => this.planos.set(res),
      error: (err: HttpErrorResponse) => console.error('Erro ao buscar planos', err)
    });
  }

  confirmarVenda() {
    if (!this.selectedPlanoId() || !this.dataInicio()) {
      alert('Por favor, selecione um plano e a data de início.');
      return;
    }

    const dto: MatriculaDTO = {
      usuarioId: this.data.alunoFixo.id, // O ID do aluno travado!
      planoId: this.selectedPlanoId()!,
      dataInicio: this.dataInicio()
    };

    this.planoService.matricularAluno(dto).subscribe({
      next: () => {
        // Encerra passando 'true' para a tabela saber que deu certo
        this.dialogRef.close(true);
      },
      error: (err: HttpErrorResponse) => {
        console.error('Erro na matrícula', err);
        alert('Erro ao processar a venda do plano.');
      }
    });
  }

  fechar() {
    this.dialogRef.close(false);
  }
}