import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatListModule } from '@angular/material/list';
import { MatDividerModule } from '@angular/material/divider';

@Component({
  selector: 'app-treino-detalhes',
  standalone: true,
  imports: [
    CommonModule, 
    MatDialogModule, 
    MatButtonModule, 
    MatIconModule, 
    MatListModule, 
    MatDividerModule
  ],
  templateUrl: './treino-detalhes.html'
})
export class TreinoDetalhesComponent {
  // Injeta os dados (o treino inteiro) que foram passados ao abrir o modal
  public data = inject(MAT_DIALOG_DATA);
  public dialogRef = inject(MatDialogRef<TreinoDetalhesComponent>);
}