import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { HttpErrorResponse } from '@angular/common/http';
import { PlanoService, Plano } from '../../core/services/plano.service';
import { PlanoFormComponent } from './plano-form/plano-form';

@Component({
  selector: 'app-planos',
  standalone: true,
  imports: [CommonModule, MatButtonModule, MatIconModule, MatDialogModule],
  templateUrl: './planos.html'
})
export class PlanosComponent implements OnInit {
[x: string]: any;
  private planoService = inject(PlanoService);
  private dialog = inject(MatDialog);

  public planos = signal<Plano[]>([]);

  ngOnInit() {
    this.carregarPlanos();
  }

  carregarPlanos() {
    this.planoService.listarPlanos().subscribe({
      next: (dados) => this.planos.set(dados),
      error: (err: HttpErrorResponse) => console.error('Erro ao buscar planos', err)
    });
  }

abrirModalNovoPlano() {
    const dialogRef = this.dialog.open(PlanoFormComponent, {
      width: '450px',
      panelClass: '!rounded-2xl',
      disableClose: true
    });

    dialogRef.afterClosed().subscribe((salvouComSucesso: boolean) => {
      if (salvouComSucesso) {
        this.carregarPlanos();
      }
    });
  }

  abrirModalEditarPlano(plano: Plano) {
    const dialogRef = this.dialog.open(PlanoFormComponent, {
      width: '450px',
      panelClass: '!rounded-2xl',
      disableClose: true,
      data: { plano: plano }
    });

    dialogRef.afterClosed().subscribe((salvouComSucesso: boolean) => {
      if (salvouComSucesso) this.carregarPlanos();
    });
  }

  deletarPlano(plano: Plano) {
    if (confirm(`Deseja realmente excluir o pacote "${plano.nome}"? Essa ação não pode ser desfeita.`)) {
      this.planoService.deletarPlano(plano.id!).subscribe({
        next: () => this.carregarPlanos(),
        error: (err: HttpErrorResponse) => {
          console.error('Erro ao excluir', err);
          alert('Não foi possível excluir o plano. Verifique se existem alunos vinculados a ele.');
        }
      });
    }
  }

}