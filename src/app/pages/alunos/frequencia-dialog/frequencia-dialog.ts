import { Component, OnInit, inject, signal } from '@angular/core';
import { DatePipe } from '@angular/common';
import { MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatPaginatorModule, MatPaginatorIntl, PageEvent } from '@angular/material/paginator';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

import { Checkin, ROTULO_MOTIVO_ACESSO, Usuario } from '../../../core/models';
import { AssinaturaService } from '../../../core/services/assinatura.service';
import { mensagemDeErro } from '../../../core/services/erro-api';
import { PaginadorIntl } from '../../../core/paginador-intl';

export interface FrequenciaDialogData {
  aluno: Usuario;
}

/**
 * Histórico de frequência do aluno: cada check-in que a catraca gravou.
 *
 * Não é uma tela nova de registro — "Conferir acesso" já grava o
 * check-in a cada chamada. Aqui só se lê o que já aconteceu.
 */
@Component({
  selector: 'app-frequencia-dialog',
  standalone: true,
  imports: [
    MatDialogModule,
    MatButtonModule,
    MatIconModule,
    MatPaginatorModule,
    MatProgressSpinnerModule,
    DatePipe,
  ],
  providers: [{ provide: MatPaginatorIntl, useClass: PaginadorIntl }],
  templateUrl: './frequencia-dialog.html',
})
export class FrequenciaDialogComponent implements OnInit {
  private readonly assinaturaService = inject(AssinaturaService);

  readonly data = inject<FrequenciaDialogData>(MAT_DIALOG_DATA);
  readonly rotuloMotivo = ROTULO_MOTIVO_ACESSO;

  readonly carregando = signal(true);
  readonly erro = signal<string | null>(null);
  readonly checkins = signal<Checkin[]>([]);
  readonly total = signal(0);
  readonly pagina = signal(0);
  readonly tamanhoPagina = signal(10);

  ngOnInit(): void {
    this.carregar();
  }

  private carregar(): void {
    this.carregando.set(true);
    this.erro.set(null);

    this.assinaturaService.historicoCheckins(this.data.aluno.id, this.pagina(), this.tamanhoPagina()).subscribe({
      next: (resultado) => {
        this.checkins.set(resultado.content);
        this.total.set(resultado.totalElements);
        this.carregando.set(false);
      },
      error: (erro) => {
        this.erro.set(mensagemDeErro(erro, 'Não foi possível carregar o histórico de frequência.'));
        this.carregando.set(false);
      },
    });
  }

  mudarPagina(evento: PageEvent): void {
    this.pagina.set(evento.pageIndex);
    this.tamanhoPagina.set(evento.pageSize);
    this.carregar();
  }
}
