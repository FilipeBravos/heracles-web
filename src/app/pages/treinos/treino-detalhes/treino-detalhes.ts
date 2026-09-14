import { Component, inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

import { Treino } from '../../../core/models';

@Component({
  selector: 'app-treino-detalhes',
  standalone: true,
  imports: [MatDialogModule, MatButtonModule, MatIconModule],
  templateUrl: './treino-detalhes.html',
})
export class TreinoDetalhesComponent {
  readonly treino = inject<Treino>(MAT_DIALOG_DATA);
  readonly dialogRef = inject(MatDialogRef<TreinoDetalhesComponent>);
}
