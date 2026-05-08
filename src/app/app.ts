import { Component, OnInit, inject } from '@angular/core'; // Adicionado inject
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router'; // Adicionado Router
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterModule, MatIconModule],
  templateUrl: './app.html',
  styleUrls: ['./app.scss']
})
export class AppComponent implements OnInit {
  // Injetamos o Router para poder navegar programaticamente
  private router = inject(Router);
  
  perfilUsuario: string | null = '';

  ngOnInit() {
    this.perfilUsuario = localStorage.getItem('tipoPerfil');
  }

  // A função que estava faltando!
  logout() {
    // 1. Limpamos tudo que está salvo no navegador (Token, Perfil, etc)
    localStorage.clear();
    
    // 2. Redirecionamos o usuário para a tela de login
    this.router.navigate(['/login']);
    
    // 3. Opcional: Forçar um reload para limpar estados residuais
    //window.location.reload(); 
  }
}