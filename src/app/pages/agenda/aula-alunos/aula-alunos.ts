import { Component, Inject, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatListModule } from '@angular/material/list';
import { AulaService, Aula } from '../../../core/services/aula.service';

@Component({
  selector: 'app-aula-alunos',
  standalone: true,
  imports: [CommonModule, MatDialogModule, MatButtonModule, MatIconModule, MatListModule],
  template: `
    <h2 mat-dialog-title class="!text-xl !font-bold text-blue-800 border-b pb-2 flex items-center gap-2">
      <mat-icon>group</mat-icon> Lista de Presença
    </h2>
    
    <mat-dialog-content class="!pt-4 min-w-[350px]">
      <p class="text-gray-600 mb-4 font-medium">{{ aula.titulo }}</p>

      @if (alunos().length === 0) {
        <div class="text-center py-8 bg-gray-50 rounded-lg border border-dashed">
          <p class="text-gray-500">Nenhum aluno inscrito ainda.</p>
        </div>
      } @else {
        <mat-list class="!pt-0">
          @for (aluno of alunos(); track aluno.id; let i = $index) {
            <mat-list-item class="border-b border-gray-100 last:border-0 !h-auto py-2">
              <span matListItemTitle class="font-medium text-gray-800 flex items-center gap-2">
                <span class="text-xs text-gray-400 w-4">{{ i + 1 }}.</span>
                {{ aluno.nome }}
              </span>
              <span matListItemLine class="text-gray-500 text-sm ml-6">{{ aluno.email }}</span>
            </mat-list-item>
          }
        </mat-list>
      }
    </mat-dialog-content>

    <mat-dialog-actions align="end" class="!pb-4 !pr-4">
      <button mat-button mat-dialog-close>Fechar</button>
    </mat-dialog-actions>
  `
})
export class AulaAlunosComponent implements OnInit {
  private aulaService = inject(AulaService);
  alunos = signal<any[]>([]); // Signal para evitar o erro NG0100

  constructor(@Inject(MAT_DIALOG_DATA) public aula: Aula) {}

  ngOnInit() {
    this.aulaService.listarAlunosInscritos(this.aula.id).subscribe({
      next: (dados) => this.alunos.set(dados),
      error: (err) => console.error('Erro ao buscar alunos', err)
    });
  }
}