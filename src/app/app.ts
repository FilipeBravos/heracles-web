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
      
      this.perfilUsuario = localStorage.getItem('tipoPerfil');
    });
  }

  ngOnInit() {
    this.perfilUsuario = localStorage.getItem('tipoPerfil');
  }

  logout() {
    localStorage.clear();
    this.perfilUsuario = null;
    this.router.navigate(['/login']);
  }
}