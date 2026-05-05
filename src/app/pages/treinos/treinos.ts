import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { TreinoFormComponent } from './treino-form/treino-form';
import { TreinoDetalhesComponent } from './treino-detalhes/treino-detalhes';

@Component({
  selector: 'app-treinos',
  standalone: true,
  imports: [CommonModule, MatTableModule, MatButtonModule, MatIconModule, MatDialogModule],
  templateUrl: './treinos.html'
})
export class TreinosComponent implements OnInit {
  private http = inject(HttpClient);
  private dialog = inject(MatDialog);
  
  displayedColumns: string[] = ['id', 'nome', 'foco', 'nivel', 'acoes'];
  dataSource = signal<any[]>([]);

  ngOnInit(): void {
    this.listarTreinos();
  }

  listarTreinos() {
    this.http.get<any[]>('http://localhost:8080/api/treinos')
      .subscribe(dados => this.dataSource.set(dados));
  }

  // Função nova para abrir o modal
  abrirModalNovoTreino() {
    const dialogRef = this.dialog.open(TreinoFormComponent, {
      width: '500px',
      panelClass: '!rounded-none' // Garante que a caixa do modal siga o design pattern
    });

    // Quando o modal fechar, ele avisa aqui
    dialogRef.afterClosed().subscribe(salvouComSucesso => {
      if (salvouComSucesso) {
        // Se salvou no banco, nós disparamos a busca na API novamente para atualizar a tabela!
        this.listarTreinos();
      }
    });
  }

  abrirDetalhes(treino: any) {
    this.dialog.open(TreinoDetalhesComponent, {
      data: treino, // Passa o treino clicado para o modal
      width: '600px',
      panelClass: '!rounded-none'
    });
  }

  abrirModalEditar(treino: any, event: Event) {
    event.stopPropagation(); // Evita abrir os detalhes do treino
    const dialogRef = this.dialog.open(TreinoFormComponent, {
      width: '500px',
      panelClass: '!rounded-none',
      data: { treino: treino }
    });

    dialogRef.afterClosed().subscribe(salvou => {
      if (salvou) this.listarTreinos();
    });
  }

  deletarTreino(treino: any, event: Event) {
    event.stopPropagation(); // Evita abrir os detalhes do treino
    if (confirm(`Atenção: Deletar a "${treino.nome}" vai removê-la de todos os alunos que a possuem. Deseja continuar?`)) {
      this.http.delete(`http://localhost:8080/api/treinos/${treino.id}`)
        .subscribe({
          next: () => this.listarTreinos(),
          error: (err) => console.error('Erro ao deletar', err)
        });
    }
  }
}