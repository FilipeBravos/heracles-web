import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms'; // 🌟 Necessário para o ngModel do input month
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
  imports: [CommonModule, FormsModule, MatTableModule, MatButtonModule, MatIconModule],
  templateUrl: './financeiro.html'
})
export class Financeiro implements OnInit {
  private dialog = inject(MatDialog);
  private financeiroService = inject(FinanceiroService);

  public lancamentos = signal<LancamentoFinanceiro[]>([]);
  public resumo = signal<ResumoFinanceiro | null>(null);
  public displayedColumns: string[] = ['descricao', 'categoria', 'vencimento', 'valor', 'tipo', 'status', 'acoes'];

  // 🌟 Signals para controlar o filtro de data
  public mesSelecionado = signal<number>(new Date().getMonth() + 1);
  public anoSelecionado = signal<number>(new Date().getFullYear());
  public mesAnoBusca = signal<string>(''); // Formato YYYY-MM para o input HTML

  ngOnInit() {
    this.sincronizarInputBusca();
    this.carregarDadosFinanceiros();
  }

  // 🌟 Atualiza o valor do input HTML para bater com os signals
  sincronizarInputBusca() {
    const mesFormatado = this.mesSelecionado().toString().padStart(2, '0');
    this.mesAnoBusca.set(`${this.anoSelecionado()}-${mesFormatado}`);
  }

  // 🌟 Modificado para enviar o mês e ano para o Service
  carregarDadosFinanceiros() {
    const mes = this.mesSelecionado();
    const ano = this.anoSelecionado();

    this.financeiroService.listarTransacoes(mes, ano).subscribe({
      next: (res) => this.lancamentos.set(res),
      error: (err: HttpErrorResponse) => console.error('Erro ao buscar fluxo de caixa', err)
    });

    this.financeiroService.getResumo(mes, ano).subscribe({
      next: (res) => this.resumo.set(res),
      error: (err: HttpErrorResponse) => console.error('Erro ao buscar resumo de caixa', err)
    });
  }

  // 🌟 Ações dos botões de filtro
  selecionarMesAtual() {
    const hoje = new Date();
    this.mesSelecionado.set(hoje.getMonth() + 1);
    this.anoSelecionado.set(hoje.getFullYear());
    this.sincronizarInputBusca();
    this.carregarDadosFinanceiros();
  }

  selecionarProximoMes() {
    let mes = this.mesSelecionado() + 1;
    let ano = this.anoSelecionado();
    
    if (mes > 12) {
      mes = 1;
      ano++;
    }
    
    this.mesSelecionado.set(mes);
    this.anoSelecionado.set(ano);
    this.sincronizarInputBusca();
    this.carregarDadosFinanceiros();
  }

  // 🌟 Evento disparado quando o usuário escolhe um mês no calendário
  alterarMesBusca(valor: string) {
    if (valor) {
      const [ano, mes] = valor.split('-');
      this.anoSelecionado.set(parseInt(ano, 10));
      this.mesSelecionado.set(parseInt(mes, 10));
      this.carregarDadosFinanceiros();
    }
  }

  abrirModalNovoLancamento() {
    const dialogRef = this.dialog.open(LancamentoFormComponent, {
      width: '550px',
      panelClass: '!rounded-2xl',
      disableClose: true
    });

    dialogRef.afterClosed().subscribe((salvou) => {
      if (salvou) this.carregarDadosFinanceiros();
    });
  }

  marcarComoPago(lanc: LancamentoFinanceiro) {
    const termoAcao = lanc.tipo === 'RECEITA' ? 'recebimento' : 'pagamento';
    if (confirm(`Deseja confirmar o ${termoAcao} de "${lanc.descricao}" no valor de R$ ${lanc.valor}?`)) {
      this.financeiroService.marcarComoPago(lanc.id!).subscribe({
        next: () => this.carregarDadosFinanceiros(),
        error: (err: HttpErrorResponse) => console.error('Erro ao dar baixa', err)
      });
    }
  }

  abrirModalEditar(lancamento: LancamentoFinanceiro) {
    const dialogRef = this.dialog.open(LancamentoFormComponent, {
      width: '550px',
      panelClass: '!rounded-2xl',
      disableClose: true,
      data: { lancamento: lancamento }
    });

    dialogRef.afterClosed().subscribe((salvou) => {
      if (salvou) this.carregarDadosFinanceiros();
    });
  }
}