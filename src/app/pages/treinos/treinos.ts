import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { TreinoFormComponent } from './treino-form/treino-form';
import { TreinoDetalhesComponent } from './treino-detalhes/treino-detalhes';

// 1. Importe o TreinoService (ajuste o caminho se necessário)
import { TreinoService } from '../../core/services/treino.service'; 

@Component({
  selector: 'app-treinos',
  standalone: true,
  imports: [CommonModule, MatTableModule, MatButtonModule, MatIconModule, MatDialogModule],
  templateUrl: './treinos.html'
})
export class TreinosComponent implements OnInit {
  private treinoService = inject(TreinoService); 
  private dialog = inject(MatDialog);
  
  displayedColumns: string[] = ['id', 'nome', 'foco', 'nivel', 'acoes'];
  dataSource = signal<any[]>([]);

  ngOnInit(): void {
    this.listarTreinos();
  }

  listarTreinos() {
    this.treinoService.listar().subscribe({
      next: (dados) => this.dataSource.set(dados),
      error: (err) => console.error('Erro ao buscar treinos:', err)
    });
  }

  abrirModalNovoTreino() {
    const dialogRef = this.dialog.open(TreinoFormComponent, {
      width: '500px',
      panelClass: '!rounded-none'
    });

    dialogRef.afterClosed().subscribe(salvouComSucesso => {
      if (salvouComSucesso) {
        this.listarTreinos();
      }
    });
  }

  abrirDetalhes(treino: any) {
    this.dialog.open(TreinoDetalhesComponent, {
      data: treino,
      width: '600px',
      panelClass: '!rounded-none'
    });
  }

  abrirModalEditar(treino: any, event: Event) {
    event.stopPropagation();
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
    event.stopPropagation(); 
    if (confirm(`Atenção: Deletar a "${treino.nome}" vai removê-la de todos os alunos que a possuem. Deseja continuar?`)) {
      
      this.treinoService.excluir(treino.id).subscribe({
        next: () => this.listarTreinos(),
        error: (err) => console.error('Erro ao deletar', err)
      });
      
    }
  }
}