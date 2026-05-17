import { Component, OnInit, signal } from '@angular/core'; 
import { CommonModule } from '@angular/common';
import { DashboardAlunoComponent } from './dashboard-aluno/dashboard-aluno'; 
import { DashboardProfessorComponent } from './dashboard-professor/dashboard-professor'; 

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, DashboardAlunoComponent, DashboardProfessorComponent],
  templateUrl: './dashboard.html'
})
export class DashboardComponent implements OnInit {
  // Signal que vai guardar 'ALUNO', 'PROFESSOR' ou null
  public perfilUsuario = signal<string | null>(null);

 ngOnInit() {
    const perfilSalvo = localStorage.getItem('tipoPerfil'); 
    
    if (perfilSalvo) {
      this.perfilUsuario.set(perfilSalvo.toUpperCase());
    } else {
      console.warn('Nenhum perfil encontrado no Local Storage para o Dashboard wrapper.');
    }
  }
}