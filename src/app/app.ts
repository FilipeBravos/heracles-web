import { Component } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { RouterOutlet } from "@angular/router"; // <-- Import do botão

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [MatButtonModule, RouterOutlet], // <-- Adicionado no array
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class AppComponent {
  title = 'heracles-web';
}