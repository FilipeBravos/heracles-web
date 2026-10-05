import { Component, OnInit, inject, signal } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatTableModule } from '@angular/material/table';
import { MatTooltipModule } from '@angular/material/tooltip';

import { Unidade } from '../../core/models';
import { UnidadeService } from '../../core/services/unidade.service';
import { mensagemDeErro } from '../../core/services/erro-api';
import { UnidadeFormComponent } from './unidade-form/unidade-form';

/**
 * Unidades da rede.
 *
 * A API já tinha o endpoint desde o início, mas nenhuma tela — e sem
 * unidade não é possível cadastrar produto nem equipamento, que são por
 * unidade.
 */
@Component({
  selector: 'app-unidades',
  standalone: true,
  imports: [
    MatTableModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatTooltipModule,
  ],
  templateUrl: './unidades.html',
})
export class UnidadesComponent implements OnInit {
  private readonly unidadeService = inject(UnidadeService);
  private readonly dialog = inject(MatDialog);
  private readonly snackBar = inject(MatSnackBar);

  readonly displayedColumns = ['nome', 'tipo', 'endereco', 'telefone', 'acoes'];

  readonly unidades = signal<Unidade[]>([]);
  readonly carregando = signal(true);
  readonly erro = signal<string | null>(null);

  ngOnInit(): void {
    this.listar();
  }

  listar(): void {
    this.carregando.set(true);
    this.erro.set(null);

    this.unidadeService.listar().subscribe({
      next: (unidades) => {
        this.unidades.set(unidades);
        this.carregando.set(false);
      },
      error: (erro) => {
        this.erro.set(mensagemDeErro(erro, 'Não foi possível carregar as unidades.'));
        this.carregando.set(false);
      },
    });
  }

  abrirFormulario(unidade: Unidade | null): void {
    this.dialog
      .open(UnidadeFormComponent, { width: '560px', data: { unidade } })
      .afterClosed()
      .subscribe((salvou) => {
        if (salvou) {
          this.snackBar.open(unidade ? 'Unidade atualizada.' : 'Unidade cadastrada.', 'Fechar', { duration: 4000 });
          this.listar();
        }
      });
  }

  rotuloTipo(unidade: Unidade): string {
    return unidade.tipo === 'CROSSFIT' ? 'CrossFit' : 'Academia';
  }
}
