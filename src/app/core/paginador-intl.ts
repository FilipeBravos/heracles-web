import { Injectable } from '@angular/core';
import { MatPaginatorIntl } from '@angular/material/paginator';

/**
 * Rotulos do paginador em portugues.
 *
 * O MatPaginatorIntl padrao e em ingles, entao "Items per page" aparecia
 * no rodape de Alunos e Treinos — a unica faixa do sistema fora do idioma.
 */
@Injectable()
export class PaginadorIntl extends MatPaginatorIntl {
  override itemsPerPageLabel = 'Itens por página:';
  override nextPageLabel = 'Próxima página';
  override previousPageLabel = 'Página anterior';
  override firstPageLabel = 'Primeira página';
  override lastPageLabel = 'Última página';

  override getRangeLabel = (page: number, pageSize: number, length: number): string => {
    if (length === 0 || pageSize === 0) {
      return `0 de ${length}`;
    }

    const total = Math.max(length, 0);
    const inicio = page * pageSize;
    // A ultima pagina costuma vir incompleta; sem o min o rodape anunciaria
    // mais registros do que a tabela mostra.
    const fim = Math.min(inicio + pageSize, total);

    return `${inicio + 1} – ${fim} de ${total}`;
  };
}
