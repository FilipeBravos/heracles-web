import { ApplicationConfig, provideZonelessChangeDetection } from '@angular/core';
import { provideRouter, withComponentInputBinding } from '@angular/router';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { provideIcones } from './core/registrar-icones';

import { authInterceptor } from './core/interceptors/auth.interceptor';
import { routes } from './app.routes';

export const appConfig: ApplicationConfig = {
  providers: [
    provideZonelessChangeDetection(),
    provideRouter(routes, withComponentInputBinding()),
    // O interceptor anexa o bearer token e derruba a sessao em 401.
    provideHttpClient(withInterceptors([authInterceptor])),
    provideAnimationsAsync(),
    // Ícones como SVG embutido, sem fonte externa nem CDN.
    provideIcones(),
  ],
};
