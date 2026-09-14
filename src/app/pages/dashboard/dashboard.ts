import { Component, inject } from '@angular/core';
import { RouterModule } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatListModule } from '@angular/material/list';
import { MatMenuModule } from '@angular/material/menu';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatToolbarModule } from '@angular/material/toolbar';

import { AuthService } from '../../core/services/auth.service';

/**
 * Casca da area logada: menu lateral, barra superior e o router-outlet
 * dos filhos. Os cartoes de estatistica vivem em DashboardHomeComponent —
 * antes o array 'estatisticas' estava duplicado aqui sem ser usado.
 */
@Component({
  selector: 'app-dashboard-shell',
  standalone: true,
  imports: [
    RouterModule,
    MatToolbarModule,
    MatSidenavModule,
    MatButtonModule,
    MatIconModule,
    MatListModule,
    MatMenuModule,
  ],
  templateUrl: './dashboard.html',
})
export class DashboardComponent {
  private readonly auth = inject(AuthService);

  readonly usuario = this.auth.usuario;

  sair(): void {
    this.auth.logout();
  }
}
