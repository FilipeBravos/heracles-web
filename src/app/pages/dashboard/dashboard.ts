import { Component, computed, inject, signal } from '@angular/core';
import { DatePipe } from '@angular/common';
import { NavigationEnd, Router, RouterModule } from '@angular/router';
import { filter } from 'rxjs';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';

import { AuthService } from '../../core/services/auth.service';
import { NotificacaoService } from '../../core/services/notificacao.service';
import { Area, areasDoPerfil } from '../../core/acesso';
import { ICONE_TIPO_NOTIFICACAO, Notificacao } from '../../core/models';

/**
 * Casca da area logada: navegacao lateral e o router-outlet dos filhos.
 *
 * A barra superior saiu. Ela carregava so uma saudacao generica e o menu
 * do usuario — uma faixa inteira para dois elementos que cabem no rodape
 * da navegacao, devolvendo essa altura ao conteudo.
 */
@Component({
  selector: 'app-dashboard-shell',
  standalone: true,
  imports: [RouterModule, MatButtonModule, MatIconModule, MatTooltipModule, DatePipe],
  templateUrl: './dashboard.html',
})
export class DashboardComponent {
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);
  private readonly notificacoesApi = inject(NotificacaoService);

  readonly usuario = this.auth.usuario;

  /**
   * Os itens do menu saem da mesma tabela que o guard de rota consulta.
   * Duas listas divergiriam, e um item que leva a 403 é pior que item nenhum.
   */
  private readonly areas = computed(() => areasDoPerfil(this.usuario()?.tipoPerfil));

  readonly areasPrincipais = computed(() => this.areas().filter((a) => !a.grupo));
  readonly areasDeOperacao = computed<Area[]>(() => this.areas().filter((a) => a.grupo === 'operacao'));
  /** Configurações, sozinha no fim do menu — nenhum perfil fica sem ela. */
  readonly areasDeConta = computed<Area[]>(() => this.areas().filter((a) => a.grupo === 'conta'));

  /**
   * Em telas estreitas a navegacao vira gaveta sobreposta. Antes ela era
   * fixa em 248px, o que em 420px de largura deixava menos de 200px para
   * a tabela — largura em que a lista de alunos nao e utilizavel.
   */
  readonly menuAberto = signal(false);

  /**
   * O painel de notificacoes: um toggle proprio, nao um mat-menu.
   *
   * O mat-menu fecha sozinho a qualquer clique interno, o que atrapalha
   * marcar uma notificacao como lida sem perder o painel de vista.
   */
  readonly painelNotificacoesAberto = signal(false);
  readonly notificacoes = signal<Notificacao[]>([]);
  readonly naoLidas = signal(0);
  readonly iconeTipoNotificacao = ICONE_TIPO_NOTIFICACAO;

  constructor() {
    this.atualizarResumoNotificacoes();

    // Navegou: fecha a gaveta e o painel, senao cobrem a pagina recem-aberta.
    this.router.events
      .pipe(filter((evento) => evento instanceof NavigationEnd))
      .subscribe(() => {
        this.menuAberto.set(false);
        this.painelNotificacoesAberto.set(false);
        this.atualizarResumoNotificacoes();
      });
  }

  alternarMenu(): void {
    this.menuAberto.update((aberto) => !aberto);
  }

  fecharMenu(): void {
    this.menuAberto.set(false);
  }

  private atualizarResumoNotificacoes(): void {
    this.notificacoesApi.resumo().subscribe((resumo) => this.naoLidas.set(resumo.naoLidas));
  }

  alternarPainelNotificacoes(): void {
    const abrindo = !this.painelNotificacoesAberto();
    this.painelNotificacoesAberto.set(abrindo);
    if (abrindo) {
      this.notificacoesApi.listar(0, 20).subscribe((pagina) => this.notificacoes.set(pagina.content));
    }
  }

  fecharPainelNotificacoes(): void {
    this.painelNotificacoesAberto.set(false);
  }

  marcarComoLida(notificacao: Notificacao): void {
    if (notificacao.lida) return;

    this.notificacoesApi.marcarComoLida(notificacao.id).subscribe(() => {
      this.notificacoes.update((lista) =>
        lista.map((n) => (n.id === notificacao.id ? { ...n, lida: true } : n)),
      );
      this.naoLidas.update((n) => Math.max(0, n - 1));
    });
  }

  marcarTodasComoLidas(): void {
    if (!this.naoLidas()) return;

    this.notificacoesApi.marcarTodasComoLidas().subscribe(() => {
      this.notificacoes.update((lista) => lista.map((n) => ({ ...n, lida: true })));
      this.naoLidas.set(0);
    });
  }

  /** Iniciais para o avatar — evita carregar imagem que nao existe. */
  readonly iniciais = computed(() => {
    const nome = this.usuario()?.nome?.trim();
    if (!nome) return '?';

    const partes = nome.split(/\s+/).filter(Boolean);
    const primeira = partes[0]?.[0] ?? '';
    const ultima = partes.length > 1 ? partes[partes.length - 1][0] : '';
    return (primeira + ultima).toUpperCase();
  });

  readonly perfilLegivel = computed(() => {
    const perfil = this.usuario()?.tipoPerfil;
    if (!perfil) return '';
    return { ALUNO: 'Aluno', PROFESSOR: 'Professor', SECRETARIA: 'Secretaria', ADMIN: 'Administrador' }[perfil];
  });

  sair(): void {
    this.auth.logout();
  }
}
