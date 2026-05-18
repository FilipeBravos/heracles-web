import { Component, Inject, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialog } from '@angular/material/dialog'; // 🌟 Importado MatDialog
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { EquipamentoService, HistoricoManutencao, Equipamento } from '../../../core/services/equipamento.service';
import { ManutencaoFormComponent } from '../manutencao-form/manutencao-form'; // 🌟 Importado o Form

@Component({
  selector: 'app-equipamento-historico',
  standalone: true,
  imports: [CommonModule, MatDialogModule, MatButtonModule, MatIconModule],
  template: `
    <h2 mat-dialog-title class="!text-xl !font-bold text-gray-800 border-b pb-2 flex items-center gap-2">
      <mat-icon class="text-amber-500">history</mat-icon> Histórico de Manutenções
    </h2>
    
    <mat-dialog-content class="!pt-4 min-w-[480px]">
      <div class="mb-4 bg-gray-50 p-3 rounded-xl border border-gray-100">
        <p class="text-sm font-bold text-gray-700">{{ equipamento.marca }} {{ equipamento.modelo }}</p>
        <p class="text-xs text-gray-500 mt-0.5">Quantidade em inventário: {{ equipamento.quantidade }} unidades</p>
      </div>

      @if (historico().length === 0) {
        <div class="text-center py-8 bg-gray-50 rounded-xl border border-dashed border-gray-200">
          <p class="text-gray-400 italic text-sm">Nenhuma manutenção registrada.</p>
        </div>
      } @else {
        <div class="flex flex-col gap-3 max-h-80 overflow-y-auto pr-1">
          @for (item of historico(); track item.id) {
            <div class="p-3 bg-white border border-gray-100 rounded-xl shadow-sm flex justify-between items-start gap-4 hover:bg-gray-50/50 group">
              <div class="flex flex-col">
                <span class="text-xs font-bold text-gray-400">{{ item.dataManutencao | date:'dd/MM/yyyy' }}</span>
                <p class="text-sm text-gray-700 mt-1 font-medium whitespace-pre-line">{{ item.descricao }}</p>
              </div>
              
              <div class="flex items-center gap-2 whitespace-nowrap">
                <button mat-icon-button class="opacity-60 hover:opacity-100 text-gray-500" (click)="editarManutencao(item)" title="Editar registro">
                  <mat-icon class="scale-75">edit</mat-icon>
                </button>
                
                <span class="text-sm font-extrabold text-red-600 bg-red-50 px-2.5 py-1 rounded-lg border border-red-100">
                  - {{ item.valor | currency:'BRL' }}
                </span>
              </div>
            </div>
          }
        </div>
      }
    </mat-dialog-content>

    <mat-dialog-actions align="end" class="!pb-4 !pr-4">
      <button mat-button class="!rounded-lg" [mat-dialog-close]="precisaRecarregarPai">Fechar</button>
    </mat-dialog-actions>
  `
})
export class EquipamentoHistoricoComponent implements OnInit {
  private equipamentoService = inject(EquipamentoService);
  private dialog = inject(MatDialog); // 🌟 Injetado para abrir o form de edição
  
  public historico = signal<HistoricoManutencao[]>([]);
  public precisaRecarregarPai = false;

  constructor(@Inject(MAT_DIALOG_DATA) public equipamento: Equipamento) {}

  ngOnInit() {
    this.carregarHistorico();
  }

  carregarHistorico() {
    this.equipamentoService.obterHistorico(this.equipamento.id!).subscribe({
      next: (dados) => this.historico.set(dados),
      error: (err) => console.error('Erro ao buscar histórico', err)
    });
  }

  // 🌟 NOVA FUNÇÃO: Abre o formulário enviando o Ativo + a linha de histórico correspondente
  editarManutencao(item: HistoricoManutencao) {
    const dialogRef = this.dialog.open(ManutencaoFormComponent, {
      width: '460px',
      panelClass: '!rounded-2xl',
      disableClose: true,
      data: { equipamento: this.equipamento, manutencao: item } // Passagem composta de dados!
    });

    dialogRef.afterClosed().subscribe((salvouComSucesso: boolean) => {
      if (salvouComSucesso) {
        this.precisaRecarregarPai = true; // Sinaliza que a tabela de fundo deve rodar o GET novamente
        this.carregarHistorico(); // Atualiza o próprio modal de histórico imediatamente
      }
    });
  }
}