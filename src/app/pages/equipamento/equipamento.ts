import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { HttpErrorResponse } from '@angular/common/http';
import {
  EquipamentoService,
  Equipamento,
} from '../../core/services/equipamento.service';
import { EquipamentoHistoricoComponent } from './historico-equipamento/historico-equipamento';
import { EquipamentoFormComponent } from './equipamento-form/equipamento-form';
import { ManutencaoFormComponent } from './manutencao-form/manutencao-form';

@Component({
  selector: 'app-equipamento',
  standalone: true,
  imports: [
    CommonModule,
    MatTableModule,
    MatButtonModule,
    MatIconModule,
    MatDialogModule,
  ],
  templateUrl: './equipamento.html',
})
export class EquipamentoComponent implements OnInit {
  private dialog = inject(MatDialog);
  private equipamentoService = inject(EquipamentoService);

  public equipamentos = signal<Equipamento[]>([]);

public displayedColumns: string[] = [
    'equipamento',
    'quantidade', 
    'ultimaManutencao', 
    'totalManutencoes', 
    'totalGasto', 
    'acoes'
  ];

  ngOnInit() {
    this.carregarEquipamentos();
  }

  carregarEquipamentos() {
    this.equipamentoService.listar().subscribe({
      next: (dados) => this.equipamentos.set(dados),
      error: (err: HttpErrorResponse) =>
        console.error('Erro ao buscar inventário de equipamentos', err),
    });
  }

  abrirModalNovoEquipamento() {
    const dialogRef = this.dialog.open(EquipamentoFormComponent, {
      width: '450px',
      panelClass: '!rounded-2xl',
      disableClose: true,
    });

    dialogRef.afterClosed().subscribe((salvouComSucesso: boolean) => {
      if (salvouComSucesso) {
        this.carregarEquipamentos();
      }
    });
  }

  abrirModalLancarManutencao(equipamento: Equipamento) {
    event?.stopPropagation();

    const dialogRef = this.dialog.open(ManutencaoFormComponent, {
      width: '460px',
      panelClass: '!rounded-2xl',
      disableClose: true,
      data: equipamento,
    });

    dialogRef.afterClosed().subscribe((salvouComSucesso: boolean) => {
      if (salvouComSucesso) {
        this.carregarEquipamentos();
      }
    });
  }

abrirHistorico(equipamento: Equipamento) {
    const dialogRef = this.dialog.open(EquipamentoHistoricoComponent, {
      data:   equipamento,
      width: '520px',
      panelClass: '!rounded-2xl'
    });

    dialogRef.afterClosed().subscribe((deveRecarregar: boolean) => {
      if (deveRecarregar) this.carregarEquipamentos();
    });
  }

  abrirModalEditar(equipamento: Equipamento) {
    event?.stopPropagation();

    const dialogRef = this.dialog.open(EquipamentoFormComponent, {
      width: '450px',
      panelClass: '!rounded-2xl',
      disableClose: true,
      data: { equipamento: equipamento }
    });

    dialogRef.afterClosed().subscribe((salvouComSucesso: boolean) => {
      if (salvouComSucesso) {
        this.carregarEquipamentos();
      }
    });
  }

  deletarEquipamento(equipamento: Equipamento) {
    // Bloqueia a abertura indesejada do modal de histórico da linha
    event?.stopPropagation();

    const nomeCompleto = `${equipamento.marca} ${equipamento.modelo}`;

    if (confirm(`Tem certeza que deseja remover "${nomeCompleto}" e todo o seu histórico do inventário?`)) {
      this.equipamentoService.deletar(equipamento.id!).subscribe({
        next: () => {
          // Recarrega a tabela na mesma hora
          this.carregarEquipamentos();
        },
        error: (err: HttpErrorResponse) => {
          console.error('Erro ao deletar equipamento', err);
          alert('Erro ao excluir o equipamento.');
        }
      });
    }
  }
}
