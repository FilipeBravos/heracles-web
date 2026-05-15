import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatTabsModule } from '@angular/material/tabs';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { TreinoService } from '../../core/services/treino.service';

@Component({
  selector: 'app-meu-treino',
  standalone: true,
  imports: [
    CommonModule, 
    MatTabsModule, 
    MatCheckboxModule, 
    MatCardModule, 
    MatIconModule
  ],
  templateUrl: './meu-treino.html'
})
export class MeuTreinoComponent implements OnInit {
  private treinoService = inject(TreinoService);
  

  treinos = signal<any[]>([]);

  ngOnInit() {
    this.treinoService.listarMeusTreinos().subscribe({
      next: (dados) => {
        const treinosFormatados = dados.map(t => ({
          ...t,
          listaExercicios: t.descricao ? t.descricao.split('\n').filter((e: string) => e.trim() !== '') : []
        }));
        
        this.treinos.set(treinosFormatados);
      },
      error: (err) => console.error('Erro ao buscar meus treinos', err)
    });
  }
}