import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatIconModule } from '@angular/material/icon';
import { FinanceiroService, LancamentoFinanceiro } from '../../../core/services/financeiro.service';
import { HttpErrorResponse } from '@angular/common/http';

@Component({
  selector: 'app-lancamento-form',
  standalone: true,
  imports: [CommonModule, FormsModule, MatDialogModule, MatButtonModule, MatInputModule, MatSelectModule, MatIconModule],
  templateUrl: './lancamento-form.html'
})
export class LancamentoFormComponent implements OnInit {
  private dialogRef = inject(MatDialogRef<LancamentoFormComponent>);
  private financeiroService = inject(FinanceiroService);
  
  private data = inject(MAT_DIALOG_DATA, { optional: true }); 

  public isEdicao = signal<boolean>(false);
  public quantidadeParcelas = signal<number>(1);

  public transacao: LancamentoFinanceiro = {
    descricao: '',
    valor: 0,
    tipo: 'RECEITA',
    categoria: 'ALUNO_MENSALIDADE',
    status: 'PENDENTE',
    dataVencimento: new Date().toISOString().substring(0, 10)
  };

  public categorias = [
    { value: 'ALUNO_MENSALIDADE', label: 'Mensalidade de Aluno' },
    { value: 'SALARIO_PROFESSOR', label: 'Salário - Professores' },
    { value: 'SALARIO_SECRETARIA', label: 'Salário - Secretaria' },
    { value: 'SALARIO_LIMPEZA', label: 'Salário - Equipe de Limpeza' },
    { value: 'MATERIAL_LIMPEZA', label: 'Material de Limpeza' },
    { value: 'MATERIAL_SECRETARIA', label: 'Material de Secretaria' },
    { value: 'MANUTENCAO', label: 'Manutenção de Equipamentos' },
    { value: 'OUTROS', label: 'Outros Custos' }
  ];

  //Se data.lancamento existir, clonamos o objeto para edição
  ngOnInit() {
    if (this.data && this.data.lancamento) {
      this.transacao = { ...this.data.lancamento };
      this.isEdicao.set(true);
    }
  }

  salvar() {
    if (!this.transacao.descricao || this.transacao.valor <= 0 || !this.transacao.dataVencimento) {
      alert('Por favor, preencha todos os campos obrigatórios.');
      return;
    }

    if (this.isEdicao()) {
      this.financeiroService.atualizarLancamento(this.transacao.id!, this.transacao).subscribe({
        next: () => this.dialogRef.close(true),
        error: (err: HttpErrorResponse) => console.error('Erro ao editar', err)
      });
    } else {
      this.financeiroService.salvarLancamento(this.transacao, this.quantidadeParcelas()).subscribe({
        next: () => this.dialogRef.close(true),
        error: (err: HttpErrorResponse) => console.error('Erro ao cadastrar', err)
      });
    }
  }

  fechar() {
    this.dialogRef.close(false);
  }
}