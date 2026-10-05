import { Injectable, signal } from '@angular/core';

/**
 * "Sistema" segue o SO; "claro" e "escuro" fixam a escolha
 * independente do que o dispositivo diz.
 */
export type Tema = 'claro' | 'escuro' | 'sistema';

const CHAVE_TEMA = 'heracles.tema';

/**
 * Preferencia de aparência do próprio dispositivo.
 *
 * Não é dado da conta: dois computadores da mesma recepção podem
 * preferir temas diferentes, e o valor nunca deveria viajar para o
 * servidor. Por isso fica em localStorage, não numa configuração ligada
 * ao usuário autenticado.
 *
 * A técnica é a propriedade CSS `color-scheme`, escrita em <html>: os
 * tokens de cor em tailwind.css usam `light-dark(claro, escuro)`, e o
 * Material resolve os próprios tokens do mesmo jeito — os dois lêem o
 * valor computado desta única propriedade, então não há nada para
 * duplicar aqui além de escrevê-la. `index.html` faz o mesmo antes do
 * Angular inicializar, para não haver um flash claro→escuro a cada
 * carregamento de quem escolheu o modo escuro.
 */
@Injectable({ providedIn: 'root' })
export class TemaService {
  readonly tema = signal<Tema>(this.lerTemaSalvo());

  constructor() {
    this.aplicar(this.tema());
  }

  definir(tema: Tema): void {
    this.tema.set(tema);
    this.aplicar(tema);
    try {
      localStorage.setItem(CHAVE_TEMA, tema);
    } catch {
      // Tema segue valendo nesta sessão; só não sobrevive a um recarregamento.
    }
  }

  private aplicar(tema: Tema): void {
    const valorCss = tema === 'escuro' ? 'dark' : tema === 'sistema' ? 'light dark' : 'light';
    document.documentElement.style.colorScheme = valorCss;
  }

  private lerTemaSalvo(): Tema {
    try {
      const salvo = localStorage.getItem(CHAVE_TEMA);
      return salvo === 'claro' || salvo === 'escuro' || salvo === 'sistema' ? salvo : 'claro';
    } catch {
      return 'claro';
    }
  }
}
