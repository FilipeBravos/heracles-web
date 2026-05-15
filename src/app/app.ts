import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, NavigationEnd, RouterModule } from '@angular/router';
import { filter } from 'rxjs/operators'; // Importante para filtrar os eventos da rota
import { MatIconModule } from '@angular/material/icon';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatListModule } from '@angular/material/list';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    CommonModule, RouterModule, MatIconModule,
    MatSidenavModule, MatListModule, MatToolbarModule, MatButtonModule
  ],
  templateUrl: './app.html',
  styleUrls: ['./app.scss']
})
export class AppComponent implements OnInit {
  private router = inject(Router);
  
  perfilUsuario: string | null = '';
  isLoginPage = false;

  constructor() {
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe((event: any) => {
      this.isLoginPage = event.urlAfterRedirects.includes('/login');
      this.carregarPerfil(); // Chama a função que limpa o perfil
    });
  }

  ngOnInit() {
    this.carregarPerfil();
  }

  // 👇 NOVA FUNÇÃO PARA BLINDAR O PERFIL 👇
carregarPerfil() {
    const perfilSalvo = localStorage.getItem('tipoPerfil'); // <-- Verifique se a chave é essa mesma no Application!
    
    console.log('O que o banco mandou (Local Storage):', perfilSalvo);

    if (perfilSalvo) {
      this.perfilUsuario = perfilSalvo.replace('ROLE_', '').toUpperCase();
      console.log('O que o menu vai usar:', this.perfilUsuario);
    } else {
      this.perfilUsuario = null;
      console.log('Nenhum perfil encontrado!');
    }
  }

  logout() {
    localStorage.clear();
    this.perfilUsuario = null;
    this.router.navigate(['/login']);
  }
}