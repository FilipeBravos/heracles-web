import { inject, provideAppInitializer } from '@angular/core';
import { MatIconRegistry } from '@angular/material/icon';
import { DomSanitizer } from '@angular/platform-browser';

import { ICONES } from './icones';

/**
 * Registra os SVG embutidos no MatIconRegistry.
 *
 * Os templates passam a usar `<mat-icon svgIcon="nome">` em vez da ligadura
 * de fonte. O bypassSecurityTrustHtml e seguro aqui porque o conteudo vem
 * de um arquivo do proprio repositorio, nao de entrada de usuario.
 */
export function provideIcones() {
  return provideAppInitializer(() => {
    const registro = inject(MatIconRegistry);
    const sanitizador = inject(DomSanitizer);

    for (const [nome, svg] of Object.entries(ICONES)) {
      registro.addSvgIconLiteral(nome, sanitizador.bypassSecurityTrustHtml(svg));
    }
  });
}
