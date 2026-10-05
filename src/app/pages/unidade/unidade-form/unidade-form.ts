import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { MatDialogRef, MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatSelectModule } from '@angular/material/select';
import { UnidadeService } from '../../../core/services/unidade.service';

@Component({
  selector: 'app-unidade-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, MatDialogModule, MatFormFieldModule, MatInputModule, MatSelectModule, MatButtonModule],
  templateUrl: './unidade-form.html'
})
export class UnidadeFormComponent {
  private fb = inject(FormBuilder);
  private unidadeService = inject(UnidadeService);
  public dialogRef = inject(MatDialogRef<UnidadeFormComponent>);

  unidadeForm = this.fb.group({
    nome: ['', Validators.required],
    tipoModalidade: ['', Validators.required],
    endereco: [''],
    telefone: ['']
  });

  salvar() {
    if (this.unidadeForm.valid) {
      this.unidadeService.cadastrar(this.unidadeForm.value).subscribe({
        next: () => this.dialogRef.close(true),
        error: (err) => console.error('Erro ao criar unidade', err)
      });
    }
  }
}