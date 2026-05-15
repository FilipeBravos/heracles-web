import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatDialogRef, MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatSnackBar } from '@angular/material/snack-bar';
import { AulaService } from '../../../core/services/aula.service'; // Ajuste o caminho se necessário

@Component({
  selector: 'app-aula-form',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
  ],
  templateUrl: './aula-form.html',
})
export class AulaFormComponent {
  private fb = inject(FormBuilder);
  private aulaService = inject(AulaService);
  private dialogRef = inject(MatDialogRef<AulaFormComponent>);
  private snackBar = inject(MatSnackBar);

  aulaForm = this.fb.nonNullable.group({
    titulo: ['', Validators.required],
    dataHora: ['', Validators.required],
    limiteVagas: [15, [Validators.required, Validators.min(1)]],
    descricao: [''], // Novo campo opcional
  });

  salvar() {
    if (this.aulaForm.valid) {
      this.aulaService.criar(this.aulaForm.value).subscribe({
        next: () => {
          this.snackBar.open('Aula criada com sucesso!', 'Fechar', {
            duration: 3000,
          });
          this.dialogRef.close(true); // Fecha o modal e avisa que salvou
        },
        error: (err) => {
          console.error('Erro ao criar aula', err);
          this.snackBar.open('Erro ao criar aula.', 'Fechar', {
            duration: 3000,
          });
        },
      });
    }
  }

  cancelar() {
    this.dialogRef.close(false);
  }
}
