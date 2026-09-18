import { Component, OnInit, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, ValidationErrors, ValidatorFn, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar } from '@angular/material/snack-bar';

import { Tema, TemaService } from '../../core/services/tema.service';
import { AuthService } from '../../core/services/auth.service';
import { MinhaAreaService } from '../../core/services/minha-area.service';
import { mensagemDeErro } from '../../core/services/erro-api';

/** As três opções de aparência, na ordem em que os botões aparecem. */
const OPCOES_TEMA: ReadonlyArray<{ valor: Tema; rotulo: string; icone: string }> = [
  { valor: 'claro', rotulo: 'Claro', icone: 'light_mode' },
  { valor: 'escuro', rotulo: 'Escuro', icone: 'dark_mode' },
  { valor: 'sistema', rotulo: 'Sistema', icone: 'brightness_auto' },
];

/**
 * A conta do próprio usuário: nome, telefone, senha e aparência.
 *
 * Só a administração alcança esta tela por ora — ver core/acesso.ts.
 * Não é cadastro de aluno nem estrutura da rede; é o que qualquer perfil
 * autenticado deveria poder ajustar em si mesmo, começando por quem já
 * usa o sistema todo dia.
 */
@Component({
  selector: 'app-configuracoes',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
  ],
  templateUrl: './configuracoes.html',
})
export class ConfiguracoesComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly minhaArea = inject(MinhaAreaService);
  private readonly auth = inject(AuthService);
  private readonly snackBar = inject(MatSnackBar);
  private readonly temaService = inject(TemaService);

  readonly opcoesTema = OPCOES_TEMA;
  readonly tema = this.temaService.tema;

  // --- Meus dados ---
  readonly carregandoDados = signal(true);
  readonly erroDados = signal<string | null>(null);
  readonly salvandoDados = signal(false);

  readonly formDados = this.fb.nonNullable.group({
    nome: ['', [Validators.required, Validators.maxLength(100)]],
    telefone: [''],
  });
  /** Preenchido no carregamento; a tela não deixa editar por aqui. */
  readonly email = signal('');

  // --- Senha ---
  readonly salvandoSenha = signal(false);
  readonly erroSenha = signal<string | null>(null);
  readonly mostrarSenhaAtual = signal(false);
  readonly mostrarNovaSenha = signal(false);

  readonly formSenha = this.fb.nonNullable.group(
    {
      senhaAtual: ['', [Validators.required]],
      novaSenha: ['', [Validators.required, Validators.minLength(8)]],
      confirmarNovaSenha: ['', [Validators.required]],
    },
    { validators: [confirmacaoBateValidator] }
  );

  ngOnInit(): void {
    this.carregarMeusDados();
  }

  carregarMeusDados(): void {
    this.carregandoDados.set(true);
    this.erroDados.set(null);

    this.minhaArea.meusDados().subscribe({
      next: (dados) => {
        this.formDados.setValue({ nome: dados.nome, telefone: dados.telefone ?? '' });
        this.email.set(dados.email);
        this.carregandoDados.set(false);
      },
      error: (erro) => {
        this.erroDados.set(mensagemDeErro(erro, 'Não foi possível carregar seus dados.'));
        this.carregandoDados.set(false);
      },
    });
  }

  salvarDados(): void {
    if (this.formDados.invalid || this.salvandoDados()) {
      this.formDados.markAllAsTouched();
      return;
    }

    this.salvandoDados.set(true);
    this.erroDados.set(null);
    const { nome, telefone } = this.formDados.getRawValue();

    this.minhaArea.atualizarMeusDados({ nome, telefone: telefone || null }).subscribe({
      next: (dados) => {
        this.salvandoDados.set(false);
        // O cartão de usuário na navegação lê o nome da sessão, não desta
        // tela — sem isto ele só atualizaria no próximo login.
        this.auth.atualizarNome(dados.nome);
        this.snackBar.open('Dados atualizados.', 'Fechar', { duration: 4000 });
      },
      error: (erro) => {
        this.salvandoDados.set(false);
        this.erroDados.set(mensagemDeErro(erro, 'Não foi possível salvar seus dados.'));
      },
    });
  }

  alternarSenhaAtual(): void {
    this.mostrarSenhaAtual.update((visivel) => !visivel);
  }

  alternarNovaSenha(): void {
    this.mostrarNovaSenha.update((visivel) => !visivel);
  }

  salvarSenha(): void {
    if (this.formSenha.invalid || this.salvandoSenha()) {
      this.formSenha.markAllAsTouched();
      return;
    }

    this.salvandoSenha.set(true);
    this.erroSenha.set(null);
    const { senhaAtual, novaSenha } = this.formSenha.getRawValue();

    this.minhaArea.trocarSenha({ senhaAtual, novaSenha }).subscribe({
      next: () => {
        this.salvandoSenha.set(false);
        // Nada fica na tela depois de trocar: nem a senha antiga, nem a
        // nova, valem a pena guardar num campo de senha.
        this.formSenha.reset();
        this.snackBar.open('Senha alterada.', 'Fechar', { duration: 4000 });
      },
      error: (erro) => {
        this.salvandoSenha.set(false);
        this.erroSenha.set(mensagemDeErro(erro, 'Não foi possível trocar sua senha.'));
      },
    });
  }

  escolherTema(tema: Tema): void {
    this.temaService.definir(tema);
  }
}

/**
 * A confirmação precisa bater com a nova senha.
 *
 * O erro é aplicado no campo de confirmação, não no grupo: o
 * `<mat-error>` do Material só aparece quando o *controle* em si está
 * inválido — um erro só no grupo desabilita o botão de enviar
 * corretamente, mas o campo nunca mostra por que.
 */
const confirmacaoBateValidator: ValidatorFn = (grupo): ValidationErrors | null => {
  const novaSenha = grupo.get('novaSenha');
  const confirmacao = grupo.get('confirmarNovaSenha');
  if (!novaSenha || !confirmacao) return null;

  const { confirmacaoNaoBate, ...outrosErros } = confirmacao.errors ?? {};

  if (confirmacao.value && novaSenha.value !== confirmacao.value) {
    confirmacao.setErrors({ ...outrosErros, confirmacaoNaoBate: true });
  } else if (confirmacaoNaoBate) {
    confirmacao.setErrors(Object.keys(outrosErros).length ? outrosErros : null);
  }

  return null;
};
