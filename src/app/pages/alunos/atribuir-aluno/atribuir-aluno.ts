import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { ProfessorService, AlunoSimples } from '../../../core/services/professor.service'; // Ajuste o caminho se necessário
import { HttpErrorResponse } from '@angular/common/http';

@Component({
  selector: 'app-atribuir-aluno',
  standalone: true,
  imports: [CommonModule, MatDialogModule, MatButtonModule, MatIconModule],
  templateUrl: './atribuir-aluno.html'
})
export class AtribuirAlunoModal {
  private dialogRef = inject(MatDialogRef<AtribuirAlunoModal>);
  private professorService = inject(ProfessorService);
  
  // 🌟 Captura os dados enviados pelo componente pai de forma estrita
  public data = inject<{ aluno: AlunoSimples }>(MAT_DIALOG_DATA);

  confirmarVinculo() {
    this.professorService.vincularAluno(this.data.aluno.id).subscribe({
      next: () => {
        // Fecha o modal enviando 'true' para indicar que o salvamento deu certo
        this.dialogRef.close(true);
      },
      error: (err: HttpErrorResponse) => {
        console.error('Erro ao vincular aluno:', err);
      }
    });
  }

  fechar() {
    this.dialogRef.close(false);
  }
}