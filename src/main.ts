import { bootstrapApplication } from '@angular/platform-browser';
import { appConfig } from './app/app.config';
import { AppComponent } from './app/app'; // <-- Mude de { App } para { AppComponent }

bootstrapApplication(AppComponent, appConfig) // <-- Mude aqui também
  .catch((err) => console.error(err));