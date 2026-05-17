import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatTabsModule } from '@angular/material/tabs'; 
import { HttpErrorResponse } from '@angular/common/http';

import { AlunoForm } from './aluno-form/aluno-form';
import { VincularTreino } from './vincular-treino/vincular-treino';
// 👇 1. IMPORTE O MODAL QUE CRIAMOS PARA ATRIBUIR (Ajuste o caminho se necessário)
import { AtribuirAlunoModal } from './atribuir-aluno/atribuir-aluno'; 

import { AlunoService } from '../../core/services/aluno.service'; 
import { AlunosPorProfessor, ProfessorService, AlunoSimples } from '../../core/services/professor.service';

@Component({
  selector: 'app-alunos',
  standalone: true,
  imports: [
    CommonModule, 
    MatTableModule, 
    MatButtonModule, 
    MatIconModule,
    MatTabsModule, 
    MatDialogModule
  ],
  templateUrl: './alunos.html'
})
export class AlunosComponent implements OnInit {
  private professorService = inject(ProfessorService);
  private dialog = inject(MatDialog);
  private alunoService = inject(AlunoService);

  public listasAlunos = signal<AlunosPorProfessor | null>(null);
  public displayedColumns: string[] = ['id', 'nome', 'cpf', 'email', 'treino', 'status', 'acoes'];

  ngOnInit() {
    this.carregarAlunos();
  }

  carregarAlunos() {
    this.professorService.getAlunosPainel().subscribe({
      next: (res) => this.listasAlunos.set(res),
      error: (err: HttpErrorResponse) => console.error('Erro ao carregar dashboard de alunos', err)
    });
  }

  abrirModalAtribuir(aluno: AlunoSimples) {
    const dialogRef = this.dialog.open(AtribuirAlunoModal, {
      width: '450px',
      panelClass: '!rounded-none',
      data: { aluno: aluno }
    });

    dialogRef.afterClosed().subscribe((vinculouComSucesso: boolean) => {
      if (vinculouComSucesso) this.carregarAlunos();
    });
  }

  desvincularAluno(aluno: AlunoSimples) {
    if (confirm(`Deseja realmente remover o(a) aluno(a) ${aluno.nome} da sua lista de particulares?`)) {
      this.professorService.desvincularAluno(aluno.id).subscribe({
        next: () => {
          // Recarrega as listas do Signal e move o aluno de aba em tempo real
          this.carregarAlunos(); 
        },
        error: (err: HttpErrorResponse) => console.error('Erro ao desvincular aluno', err)
      });
    }
  }

  abrirModalNovoAluno() {
    const dialogRef = this.dialog.open(AlunoForm, {
      width: '600px',
      panelClass: '!rounded-none'
    });

    dialogRef.afterClosed().subscribe((salvouComSucesso: boolean) => {
      if (salvouComSucesso) this.carregarAlunos();
    });
  }

  abrirModalEditarAluno(aluno: any) {
    const dialogRef = this.dialog.open(AlunoForm, {
      width: '600px',
      panelClass: '!rounded-none',
      data: { aluno: aluno }
    });

    dialogRef.afterClosed().subscribe((salvouComSucesso: boolean) => {
      if (salvouComSucesso) this.carregarAlunos();
    });
  }

  abrirModalVinculo(aluno: any) {
    const dialogRef = this.dialog.open(VincularTreino, {
      width: '500px',
      panelClass: '!rounded-none',
      data: { aluno: aluno }
    });

    dialogRef.afterClosed().subscribe((salvou: boolean) => {
      if (salvou) this.carregarAlunos();
    });
  }

  alternarStatus(aluno: any) {
    const acao = aluno.status === 'ATIVO' ? 'inativar' : 'reativar';
    
    if (confirm(`Deseja realmente ${acao} o(a) aluno(a) ${aluno.nome}?`)) {
      this.alunoService.alternarStatusAluno(aluno.id)
        .subscribe({
          next: () => {
            this.carregarAlunos();
          },
          error: (err: HttpErrorResponse) => console.error('Erro ao alterar status', err)
        });
    }
  }
}