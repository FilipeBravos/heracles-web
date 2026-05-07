import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDialog } from '@angular/material/dialog';
import { AlunoForm } from './aluno-form/aluno-form';
import { VincularTreino } from './vincular-treino/vincular-treino';
// Importe o seu serviço aqui (ajuste o caminho se necessário)
import { AlunoService } from '../../core/services/aluno.service'; 

@Component({
  selector: 'app-alunos',
  standalone: true,
  imports: [CommonModule, MatTableModule, MatButtonModule, MatIconModule],
  templateUrl: './alunos.html'
})
export class AlunosComponent implements OnInit {
  // Injetamos o serviço ao invés do HttpClient direto
  private alunoService = inject(AlunoService);
  private dialog = inject(MatDialog);
  
  displayedColumns: string[] = ['id', 'nome', 'cpf', 'email', 'treino', 'status', 'acoes'];
  
  dataSource = signal<any[]>([]);

  ngOnInit(): void {
    this.listarAlunos();
  }

  listarAlunos() {
    // Usando o serviço para buscar os dados
    this.alunoService.listarAlunos()
      .subscribe({
        next: (dados) => {
          this.dataSource.set(dados);
        },
        error: (err) => {
          console.error('Erro ao buscar usuários:', err);
        }
      });
  }

  abrirModalNovoAluno() {
    const dialogRef = this.dialog.open(AlunoForm, {
      width: '600px',
      panelClass: '!rounded-none'
    });

    dialogRef.afterClosed().subscribe(salvouComSucesso => {
      if (salvouComSucesso) this.listarAlunos();
    });
  }

  abrirModalEditarAluno(aluno: any) {
    const dialogRef = this.dialog.open(AlunoForm, {
      width: '600px',
      panelClass: '!rounded-none',
      data: { aluno: aluno }
    });

    dialogRef.afterClosed().subscribe(salvouComSucesso => {
      if (salvouComSucesso) this.listarAlunos();
    });
  }

  abrirModalVinculo(aluno: any) {
    const dialogRef = this.dialog.open(VincularTreino, {
      width: '500px',
      panelClass: '!rounded-none',
      data: { aluno: aluno }
    });

    dialogRef.afterClosed().subscribe(salvou => {
      if (salvou) this.listarAlunos();
    });
  }

  alternarStatus(aluno: any) {
    const acao = aluno.status === 'ATIVO' ? 'inativar' : 'reativar';
    
    if (confirm(`Deseja realmente ${acao} o(a) aluno(a) ${aluno.nome}?`)) {
      // Usando o serviço para alterar o status
      this.alunoService.alternarStatusAluno(aluno.id)
        .subscribe({
          next: () => {
            this.listarAlunos();
          },
          error: (err) => console.error('Erro ao alterar status', err)
        });
    }
  }
}