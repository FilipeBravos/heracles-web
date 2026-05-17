import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { HttpErrorResponse } from '@angular/common/http';
import { ProfessorService, AlunosPorProfessor } from '../../core/services/professor.service';

@Component({
  selector: 'app-gerenciamento-alunos',
  standalone: true,
  imports: [CommonModule, MatCardModule, MatIconModule],
  templateUrl: './gerenciamento-alunos.html'
})
export class GerenciamentoAlunosComponent implements OnInit {
  private professorService = inject(ProfessorService);
  
  // Signal protegido contra null usando a interface limpa
  public listasAlunos = signal<AlunosPorProfessor | null>(null);

  ngOnInit() {
    this.professorService.getAlunosPainel().subscribe({
      next: (res) => this.listasAlunos.set(res),
      error: (err: HttpErrorResponse) => console.error('Erro ao buscar alunos do painel', err)
    });
  }
}