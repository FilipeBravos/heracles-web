import { Component, OnInit, inject, signal } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatPaginatorIntl, MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatTableModule } from '@angular/material/table';
import { MatTooltipModule } from '@angular/material/tooltip';

import { Treino } from '../../core/models';
import { TreinoService } from '../../core/services/treino.service';
import { mensagemDeErro } from '../../core/services/erro-api';
import { PaginadorIntl } from '../../core/paginador-intl';
import { TreinoDetalhesComponent } from './treino-detalhes/treino-detalhes';
import { TreinoFormComponent } from './treino-form/treino-form';

@Component({
  selector: 'app-treinos',
  standalone: true,
  imports: [
    MatTableModule,
    MatButtonModule,
    MatIconModule,
    MatPaginatorModule,
    MatProgressSpinnerModule,
    MatTooltipModule,
  ],
  templateUrl: './treinos.html',
  // Rótulos do paginador em português. Providos aqui, e não na raiz:
  // importar o paginador em app.config arrastava o módulo inteiro para
  // o bundle inicial, que é carregado antes mesmo do login.
  providers: [{ provide: MatPaginatorIntl, useClass: PaginadorIntl }],
})
export class TreinosComponent implements OnInit {
  private readonly treinoService = inject(TreinoService);
  private readonly dialog = inject(MatDialog);
  private readonly snackBar = inject(MatSnackBar);

  readonly displayedColumns = ['nome', 'nivel', 'exercicios', 'volume', 'acoes'];

  readonly treinos = signal<Treino[]>([]);
  readonly carregando = signal(true);
  readonly erro = signal<string | null>(null);
  readonly total = signal(0);
  readonly pagina = signal(0);
  readonly tamanhoPagina = signal(20);

  ngOnInit(): void {
    this.listar();
  }

  listar(): void {
    this.carregando.set(true);
    this.erro.set(null);

    this.treinoService.listar(this.pagina(), this.tamanhoPagina()).subscribe({
      next: (pagina) => {
        this.treinos.set(pagina.content);
        this.total.set(pagina.totalElements);
        this.carregando.set(false);
      },
      error: (erro) => {
        this.erro.set(mensagemDeErro(erro, 'Não foi possível carregar os treinos.'));
        this.carregando.set(false);
      },
    });
  }

  mudarPagina(evento: PageEvent): void {
    this.pagina.set(evento.pageIndex);
    this.tamanhoPagina.set(evento.pageSize);
    this.listar();
  }

  abrirModalNovoTreino(): void {
    this.abrirFormulario(null);
  }

  abrirModalEditar(treino: Treino, evento: Event): void {
    evento.stopPropagation();
    this.abrirFormulario(treino);
  }

  private abrirFormulario(treino: Treino | null): void {
    this.dialog
      .open(TreinoFormComponent, { width: '640px', panelClass: '!rounded-none', data: { treino } })
      .afterClosed()
      .subscribe((salvou) => {
        if (salvou) {
          this.snackBar.open(treino ? 'Ficha atualizada.' : 'Ficha criada.', 'Fechar', { duration: 4000 });
          this.listar();
        }
      });
  }

  abrirDetalhes(treino: Treino): void {
    this.dialog.open(TreinoDetalhesComponent, {
      data: treino,
      width: '600px',
      panelClass: '!rounded-none',
    });
  }

  deletarTreino(treino: Treino, evento: Event): void {
    evento.stopPropagation();

    const confirmacao = `Excluir a ficha "${treino.nome}" vai removê-la de todos os alunos que a possuem. Deseja continuar?`;
    if (!confirm(confirmacao)) {
      return;
    }

    this.treinoService.deletar(treino.id).subscribe({
      next: () => {
        this.snackBar.open('Ficha excluída.', 'Fechar', { duration: 4000 });
        this.listar();
      },
      error: (erro) => this.snackBar.open(mensagemDeErro(erro), 'Fechar', { duration: 6000 }),
    });
  }
}
