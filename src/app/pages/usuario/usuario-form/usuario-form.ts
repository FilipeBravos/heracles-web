import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { MatDialogRef, MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatSelectModule } from '@angular/material/select';
import { UsuarioService } from '../../../core/services/usuario.service';

@Component({
  selector: 'app-usuario-form',
  standalone: true,
  imports: [
    CommonModule, ReactiveFormsModule, MatDialogModule, 
    MatFormFieldModule, MatInputModule, MatSelectModule, MatButtonModule
  ],
  templateUrl: './usuario-form.html'
})
export class UsuarioFormComponent {
  private fb = inject(FormBuilder);
  private usuarioService = inject(UsuarioService);
  public dialogRef = inject(MatDialogRef<UsuarioFormComponent>);

  // Formulário mapeado para o DTO do Spring Boot
  usuarioForm = this.fb.group({
    nome: ['', Validators.required],
    email: ['', [Validators.required, Validators.email]],
    cpf: ['', Validators.required],
    telefone: ['', Validators.required],
    senha: ['', [Validators.required, Validators.minLength(6)]],
    tipoPerfil: ['', Validators.required], // PROFESSOR, ADMIN, RECEPCAO, SECRETARIA
    unidadeId: [null as number | null, Validators.required] // Filial
  });

  salvar() {
    if (this.usuarioForm.valid) {
      const payload = {
        ...this.usuarioForm.value,
        // Limpa a máscara do CPF antes de mandar pro banco
        cpf: this.usuarioForm.value.cpf?.replace(/\D/g, '') 
      };

      this.usuarioService.cadastrar(payload).subscribe({
        next: () => this.dialogRef.close(true), // Fecha e avisa que deu certo
        error: (err) => console.error('Erro ao cadastrar funcionário', err)
      });
    }
  }
}