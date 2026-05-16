import { ChangeDetectorRef, Component, OnInit, inject, signal } from '@angular/core';
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

  private cdr = inject(ChangeDetectorRef);
  

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

 toggleExercicio(exercicio: any) {
    this.treinoService.toggleExercicioConcluido(exercicio.id).subscribe({
      next: (isConcluido) => {
        exercicio.concluidoHoje = isConcluido;
        console.log(`Exercício ${exercicio.nome} está concluído?`, isConcluido);
        
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Erro ao salvar progresso do exercício:', err);
        exercicio.concluidoHoje = !exercicio.concluidoHoje;
        
        this.cdr.detectChanges();
      }
    });
  }
}