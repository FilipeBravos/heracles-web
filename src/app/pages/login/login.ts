import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

import { rotaInicial } from '../../core/acesso';
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
  /** Ver a senha digitada evita a terceira tentativa errada antes do bloqueio. */
  readonly mostrarSenha = signal(false);
  readonly erro = signal<string | null>(null);
  readonly sessaoExpirada = signal(
    this.rota.snapshot.queryParamMap.get('sessaoExpirada') === 'true'
  );

  /**
   * O perfil autenticou, mas não alcança nenhuma tela.
   *
   * Hoje é o caso do aluno: o sistema ainda não tem área para ele. Dizer
   * isso é melhor que deixá-lo entrar e receber erro em cada tela.
   */
  readonly semArea = signal(this.rota.snapshot.queryParamMap.get('motivo') === 'sem-area');

  // Os campos agora estao ligados ao formulario. Antes o template tinha dois
  // matInput soltos, sem formControlName nem ngModel: o que fosse digitado
  // nao chegava a lugar nenhum.
  readonly form = this.fb.nonNullable.group({
    email: ['', [Validators.required, Validators.email]],
    senha: ['', [Validators.required]],
  });

  alternarSenha(): void {
    this.mostrarSenha.update((visivel) => !visivel);
  }

  entrar(): void {
    if (this.form.invalid || this.enviando()) {
      this.form.markAllAsTouched();
      return;
    }

    this.enviando.set(true);
    this.erro.set(null);
    this.sessaoExpirada.set(false);
    this.semArea.set(false);

    this.auth.login(this.form.getRawValue()).subscribe({
      next: (resposta) => {
        const inicial = rotaInicial(resposta.usuario.tipoPerfil);

        if (!inicial) {
          // Autenticou, mas não há tela para este perfil. Entrar só para
          // colidir com o guard na próxima rota não ajuda ninguém.
          this.auth.encerrarSessao();
          this.enviando.set(false);
          this.semArea.set(true);
          return;
        }

        // O destino guardado só vale se o perfil alcança: um link salvo
        // de outra sessão pode apontar para tela que não é dele.
        const guardado = this.rota.snapshot.queryParamMap.get('redirecionar');
        void this.router.navigateByUrl(guardado ?? inicial);
      },
      error: (erro) => {
        this.enviando.set(false);
        this.erro.set(mensagemDeErro(erro, 'Nao foi possivel entrar. Tente novamente.'));
      },
    });
  }
}
