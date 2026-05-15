import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'app-aula-detalhes',
  standalone: true, // <-- MUITO IMPORTANTE
  imports: [CommonModule, MatDialogModule, MatButtonModule],
  template: `
    <h2 mat-dialog-title>Detalhes da Aula</h2>
    <mat-dialog-content>
      <p><strong>Exercícios:</strong></p>
      <div class="whitespace-pre-line">{{ data.descricao }}</div>
    </mat-dialog-content>
    <mat-dialog-actions align="end">
      <button mat-button mat-dialog-close>Fechar</button>
    </mat-dialog-actions>
  `
})
export class AulaDetalhesComponent {
  constructor(@Inject(MAT_DIALOG_DATA) public data: any) {}
}