import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { HttpErrorResponse } from '@angular/common/http';
import { SuplementoService, Suplemento } from '../../core/services/suplemento.service';
import { SuplementoFormComponent } from './suplemento-form/suplemento-form';
import { PedidoFormComponent } from './pedido-form/pedido-form';


@Component({
  selector: 'app-suplementos',
  standalone: true,
  imports: [
    CommonModule,
    MatButtonModule,
    MatIconModule,
    MatDialogModule
  ],
  templateUrl: './suplementos.html'
})
export class SuplementosComponent implements OnInit {
  private dialog = inject(MatDialog);
  private suplementoService = inject(SuplementoService);

  public suplementos = signal<Suplemento[]>([]);

  ngOnInit() {
    this.carregarVitrine();
  }

  carregarVitrine() {
    this.suplementoService.listar().subscribe({
      next: (dados) => this.suplementos.set(dados),
      error: (err: HttpErrorResponse) => console.error('Erro ao carregar a loja', err)
    });
  }

 abrirModalNovoSuplemento() {
    const dialogRef = this.dialog.open(SuplementoFormComponent, {
      width: '450px',
      panelClass: '!rounded-2xl',
      disableClose: true
    });

    dialogRef.afterClosed().subscribe((salvouComSucesso: boolean) => {
      if (salvouComSucesso) this.carregarVitrine();
    });
  }

abrirModalPedido(produto: Suplemento) {
    const dialogRef = this.dialog.open(PedidoFormComponent, {
      width: '420px',
      panelClass: '!rounded-2xl',
      disableClose: true,
      data: produto
    });

    dialogRef.afterClosed().subscribe((compraRealizada: boolean) => {
      if (compraRealizada) {
        this.carregarVitrine();
      }
    });
  }

  abrirModalEditar(produto: Suplemento) {
    const dialogRef = this.dialog.open(SuplementoFormComponent, {
      width: '450px',
      panelClass: '!rounded-2xl',
      disableClose: true,
      data: { produto: produto }
    });

    dialogRef.afterClosed().subscribe((salvouComSucesso: boolean) => {
      if (salvouComSucesso) this.carregarVitrine();
    });
  }

  deletarProduto(produto: Suplemento) {
    if (confirm(`Deseja realmente remover o produto "${produto.nome}" da loja?`)) {
      this.suplementoService.deletar(produto.id!).subscribe({
        next: () => this.carregarVitrine(),
        error: (err: HttpErrorResponse) => console.error('Erro ao excluir produto', err)
      });
    }
  }
}