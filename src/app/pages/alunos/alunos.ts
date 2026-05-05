import { Component, OnInit, inject, signal } from '@angular/core'; // <-- Importe o 'signal'
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { AlunoForm } from './aluno-form/aluno-form';
import { VincularTreino } from './vincular-treino/vincular-treino';

@Component({
  selector: 'app-alunos',
  standalone: true,
  imports: [CommonModule, MatTableModule, MatButtonModule, MatIconModule],
  templateUrl: './alunos.html'
})
export class AlunosComponent implements OnInit {
  private http = inject(HttpClient);
  private dialog = inject(MatDialog);
  
  displayedColumns: string[] = ['id', 'nome', 'cpf', 'email', 'treino', 'status', 'acoes'];
  
  // 1. Transforme o array comum em um Signal
  dataSource = signal<any[]>([]);

  ngOnInit(): void {
    this.listarAlunos();
  }

  listarAlunos() {
    this.http.get<any[]>('http://localhost:8080/api/usuarios')
      .subscribe({
        next: (dados) => {
          // 2. Use o .set() para avisar o Angular que os dados chegaram
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
      if (salvouComSucesso) {
        // Atualiza a tabela chamando a API novamente se salvou com sucesso
        this.listarAlunos();
      }
    });
  }

  abrirModalEditarAluno(aluno: any) {
    const dialogRef = this.dialog.open(AlunoForm, {
      width: '600px',
      panelClass: '!rounded-none',
      data: { aluno: aluno } // Manda os dados do aluno para o modal
    });

    dialogRef.afterClosed().subscribe(salvouComSucesso => {
      if (salvouComSucesso) this.listarAlunos(); // Recarrega a tabela se houve edição
    });
  }

  abrirModalVinculo(aluno: any) {
    const dialogRef = this.dialog.open(VincularTreino, {
      width: '500px',
      panelClass: '!rounded-none',
      data: { aluno: aluno } // Manda o aluno para o modal saber quem é
    });

    dialogRef.afterClosed().subscribe(salvou => {
      if (salvou) this.listarAlunos(); // Recarrega a tabela para mostrar o treino atualizado
    });
  }

  alternarStatus(aluno: any) {
    const acao = aluno.status === 'ATIVO' ? 'inativar' : 'reativar';
    
    // Pede uma confirmação rápida antes de mudar o status
    if (confirm(`Deseja realmente ${acao} o(a) aluno(a) ${aluno.nome}?`)) {
      this.http.put(`http://localhost:8080/api/usuarios/${aluno.id}/status`, {})
        .subscribe({
          next: () => {
            this.listarAlunos(); // Recarrega a tabela para atualizar a tela
          },
          error: (err) => console.error('Erro ao alterar status', err)
        });
    }
  }
}