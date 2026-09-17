import { Component, computed, inject, signal } from '@angular/core';
import { NavigationEnd, Router, RouterModule } from '@angular/router';
import { filter } from 'rxjs';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';

import { AuthService } from '../../core/services/auth.service';
import { Area, areasDoPerfil } from '../../core/acesso';

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
  imports: [RouterModule, MatButtonModule, MatIconModule, MatTooltipModule],
  templateUrl: './dashboard.html',
})
export class DashboardComponent {
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);

  readonly usuario = this.auth.usuario;

  /**
   * Os itens do menu saem da mesma tabela que o guard de rota consulta.
   * Duas listas divergiriam, e um item que leva a 403 é pior que item nenhum.
   */
  private readonly areas = computed(() => areasDoPerfil(this.usuario()?.tipoPerfil));

  readonly areasPrincipais = computed(() => this.areas().filter((a) => !a.grupo));
  readonly areasDeOperacao = computed<Area[]>(() => this.areas().filter((a) => a.grupo === 'operacao'));

  /**
   * Em telas estreitas a navegacao vira gaveta sobreposta. Antes ela era
   * fixa em 248px, o que em 420px de largura deixava menos de 200px para
   * a tabela — largura em que a lista de alunos nao e utilizavel.
   */
  readonly menuAberto = signal(false);

  constructor() {
    // Navegou: fecha a gaveta, senao ela cobre a pagina recem-aberta.
    this.router.events
      .pipe(filter((evento) => evento instanceof NavigationEnd))
      .subscribe(() => this.menuAberto.set(false));
  }

  alternarMenu(): void {
    this.menuAberto.update((aberto) => !aberto);
  }

  fecharMenu(): void {
    this.menuAberto.set(false);
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
