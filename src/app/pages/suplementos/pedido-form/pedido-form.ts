import { Component, Inject, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { SuplementoService, Suplemento, RequisicaoVenda } from '../../../core/services/suplemento.service';
import { HttpErrorResponse } from '@angular/common/http';

@Component({
  selector: 'app-pedido-form',
  standalone: true,
  imports: [CommonModule, FormsModule, MatDialogModule, MatButtonModule, MatInputModule, MatIconModule],
  templateUrl: './pedido-form.html'
})
export class PedidoFormComponent implements OnInit {
  private dialogRef = inject(MatDialogRef<PedidoFormComponent>);
  private suplementoService = inject(SuplementoService);

  // Signals para reatividade do cálculo de preço
  public quantidade = signal<number>(1);
  public nomeComprador = signal<string>('');

  // Cálculo automático do valor total (Preço unitário * Quantidade)
  public valorTotal = computed(() => this.produto.preco * this.quantidade());

  constructor(@Inject(MAT_DIALOG_DATA) public produto: Suplemento) {}

  ngOnInit() {
    // Garante que o nome do usuário logado venha preenchido se possível (opcional)
    const usuario = JSON.parse(localStorage.getItem('usuario') || '{}');
    if (usuario.nome) this.nomeComprador.set(usuario.nome);
  }

  confirmarVenda() {
    // Validações de segurança
    if (this.quantidade() > this.produto.quantidadeEstoque) {
      alert('Quantidade superior ao estoque disponível!');
      return;
    }

    if (!this.nomeComprador()) {
      alert('Por favor, informe o nome do comprador.');
      return;
    }

    const payload: RequisicaoVenda = {
      quantidade: this.quantidade(),
      nomeComprador: this.nomeComprador()
    };

    this.suplementoService.vender(this.produto.id!, payload).subscribe({
      next: () => {
        // Sucesso: Fecha o modal e atualiza a vitrine de fundo
        this.dialogRef.close(true);
      },
      error: (err: HttpErrorResponse) => {
        console.error('Erro na venda', err);
        alert(err.error?.message || 'Erro ao processar a venda.');
      }
    });
  }

  fechar() {
    this.dialogRef.close(false);
  }
}