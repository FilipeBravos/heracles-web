import { Injectable, computed, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, tap } from 'rxjs';

import { environment } from '../../../environments/environment';
import { Credenciais, RespostaLogin, UsuarioAutenticado } from '../models';

const CHAVE_TOKEN = 'heracles.token';
const CHAVE_USUARIO = 'heracles.usuario';

/**
 * Autenticacao real contra POST /api/auth/login.
 *
 * A versao anterior recebia e-mail e senha, ignorava os dois e fazia um GET
 * na lista de usuarios — nao havia login nenhum.
 */
@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly http = inject(HttpClient);
  private readonly router = inject(Router);

  private readonly usuarioAtual = signal<UsuarioAutenticado | null>(this.lerUsuarioSalvo());

  readonly usuario = this.usuarioAtual.asReadonly();
  readonly autenticado = computed(() => this.usuarioAtual() !== null);
  readonly ehAdmin = computed(() => this.usuarioAtual()?.tipoPerfil === 'ADMIN');

  login(credenciais: Credenciais): Observable<RespostaLogin> {
    return this.http
      .post<RespostaLogin>(`${environment.apiUrl}/auth/login`, credenciais)
      .pipe(tap((resposta) => this.registrarSessao(resposta)));
  }

  logout(): void {
    this.encerrarSessao();
    void this.router.navigate(['/login']);
  }

  /**
   * Limpa a sessão sem navegar.
   *
   * Existe para quem já está decidindo o destino — um guard que devolve
   * UrlTree, por exemplo. Chamar `logout()` ali poria duas navegações
   * competindo pela mesma transição.
   */
  encerrarSessao(): void {
    this.limparSessao();
  }

  get token(): string | null {
    try {
      return localStorage.getItem(CHAVE_TOKEN);
    } catch {
      // Navegacao privada ou storage bloqueado: trata como nao autenticado.
      return null;
    }
  }

  private registrarSessao(resposta: RespostaLogin): void {
    try {
      localStorage.setItem(CHAVE_TOKEN, resposta.token);
      localStorage.setItem(CHAVE_USUARIO, JSON.stringify(resposta.usuario));
    } catch {
      // Sessao segue valida em memoria ate o recarregamento da pagina.
    }
    this.usuarioAtual.set(resposta.usuario);
  }

  private limparSessao(): void {
    try {
      localStorage.removeItem(CHAVE_TOKEN);
      localStorage.removeItem(CHAVE_USUARIO);
    } catch {
      // Nada a fazer: o estado em memoria e limpo abaixo de qualquer forma.
    }
    this.usuarioAtual.set(null);
  }

  private lerUsuarioSalvo(): UsuarioAutenticado | null {
    try {
      const bruto = localStorage.getItem(CHAVE_USUARIO);
      return bruto ? (JSON.parse(bruto) as UsuarioAutenticado) : null;
    } catch {
      return null;
    }
  }

  /** Usado pelo interceptor quando a API responde 401. */
  encerrarPorTokenInvalido(): void {
    this.limparSessao();
    void this.router.navigate(['/login'], { queryParams: { sessaoExpirada: true } });
  }

  /**
   * Atualiza o nome exibido depois que a tela de Configurações salva um
   * novo. Sem isto, o cartão de usuário na navegação mostraria o nome
   * antigo até o próximo login — a sessão inteira já leu o token uma vez
   * e guardou o retrato daquele momento.
   */
  atualizarNome(novoNome: string): void {
    const atual = this.usuarioAtual();
    if (!atual) return;

    const atualizado: UsuarioAutenticado = { ...atual, nome: novoNome };
    try {
      localStorage.setItem(CHAVE_USUARIO, JSON.stringify(atualizado));
    } catch {
      // Sessao segue valida em memoria ate o recarregamento da pagina.
    }
    this.usuarioAtual.set(atualizado);
  }
}
