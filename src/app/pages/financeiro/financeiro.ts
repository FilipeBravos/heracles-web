import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { HttpErrorResponse } from '@angular/common/http';
import { FinanceiroService, LancamentoFinanceiro, ResumoFinanceiro } from '../../core/services/financeiro.service';
import { MatDialog } from '@angular/material/dialog';
import { LancamentoFormComponent } from './lancamento-form/lancamento-form';

@Component({
  selector: 'app-financeiro',
  standalone: true,
  imports: [CommonModule, MatTableModule, MatButtonModule, MatIconModule],
  templateUrl: './financeiro.html'
})
export class Financeiro implements OnInit {
  private dialog = inject(MatDialog);
  private financeiroService = inject(FinanceiroService);

  public lancamentos = signal<LancamentoFinanceiro[]>([]);
  public resumo = signal<ResumoFinanceiro | null>(null);
  public displayedColumns: string[] = ['descricao', 'categoria', 'vencimento', 'valor', 'tipo', 'status', 'acoes'];

  ngOnInit() {
    this.carregarDadosFinanceiros();
  }

  carregarDadosFinanceiros() {
    this.financeiroService.listarTransacoes().subscribe({
      next: (res) => this.lancamentos.set(res),
      error: (err: HttpErrorResponse) => console.error('Erro ao buscar fluxo de caixa', err)
    });

    this.financeiroService.getResumo().subscribe({
      next: (res) => this.resumo.set(res),
      error: (err: HttpErrorResponse) => console.error('Erro ao buscar resumo de caixa', err)
    });
  }

 abrirModalNovoLancamento() {
    const dialogRef = this.dialog.open(LancamentoFormComponent, {
      width: '550px',
      panelClass: '!rounded-2xl',
      disableClose: true
    });

    dialogRef.afterClosed().subscribe((salvouComSucesso: boolean) => {
      if (salvouComSucesso) {
        this.carregarDadosFinanceiros();
      }
    });
  }

  marcarComoPago(lanc: LancamentoFinanceiro) {
    const termoAcao = lanc.tipo === 'RECEITA' ? 'recebimento' : 'pagamento';
    
    if (confirm(`Deseja confirmar o ${termoAcao} de "${lanc.descricao}" no valor de R$ ${lanc.valor}?`)) {
      this.financeiroService.marcarComoPago(lanc.id!).subscribe({
        next: () => {
          // Recarrega os dados (Tabela e os Cards de Saldo são recalculados na hora!)
          this.carregarDadosFinanceiros(); 
        },
        error: (err: HttpErrorResponse) => console.error('Erro ao dar baixa no lançamento', err)
      });
    }
  }

  abrirModalEditar(lancamento: LancamentoFinanceiro) {
    const dialogRef = this.dialog.open(LancamentoFormComponent, {
      width: '550px',
      panelClass: '!rounded-2xl',
      disableClose: true,
      data: { lancamento: lancamento } // 🌟 Injeta os dados para o modal ler no ngOnInit
    });

    dialogRef.afterClosed().subscribe((salvouComSucesso: boolean) => {
      if (salvouComSucesso) {
        this.carregarDadosFinanceiros();
      }
    });
  }
}