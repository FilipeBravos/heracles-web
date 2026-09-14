import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

import { AuthService } from '../../core/services/auth.service';
import { mensagemDeErro } from '../../core/services/erro-api';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
  ],
  templateUrl: './login.html',
})
export class LoginComponent {
  private readonly fb = inject(FormBuilder);
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);
  private readonly rota = inject(ActivatedRoute);

  readonly enviando = signal(false);
  readonly erro = signal<string | null>(null);
  readonly sessaoExpirada = signal(
    this.rota.snapshot.queryParamMap.get('sessaoExpirada') === 'true'
  );

  // Os campos agora estao ligados ao formulario. Antes o template tinha dois
  // matInput soltos, sem formControlName nem ngModel: o que fosse digitado
  // nao chegava a lugar nenhum.
  readonly form = this.fb.nonNullable.group({
    email: ['', [Validators.required, Validators.email]],
    senha: ['', [Validators.required]],
  });

  entrar(): void {
    if (this.form.invalid || this.enviando()) {
      this.form.markAllAsTouched();
      return;
    }

    this.enviando.set(true);
    this.erro.set(null);
    this.sessaoExpirada.set(false);

    this.auth.login(this.form.getRawValue()).subscribe({
      next: () => {
        const destino = this.rota.snapshot.queryParamMap.get('redirecionar') ?? '/dashboard';
        void this.router.navigateByUrl(destino);
      },
      error: (erro) => {
        this.enviando.set(false);
        this.erro.set(mensagemDeErro(erro, 'Nao foi possivel entrar. Tente novamente.'));
      },
    });
  }
}
