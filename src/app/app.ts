import { Component, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';

import { TemaService } from './core/services/tema.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet],
  templateUrl: './app.html',
})
export class AppComponent {
  readonly title = 'heracles-web';

  // Injetado só para existir desde o boot: o construtor do serviço já
  // aplica o tema salvo. index.html faz o mesmo antes disto rodar, para
  // não haver flash — isto garante que o estado do serviço (o signal que
  // a tela de Configurações lê) bata com o que já está na tela.
  private readonly tema = inject(TemaService);
}
