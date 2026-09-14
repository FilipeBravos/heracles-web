import { ApplicationConfig, LOCALE_ID, provideZonelessChangeDetection } from '@angular/core';
import { registerLocaleData } from '@angular/common';
import localePt from '@angular/common/locales/pt';
import { provideRouter, withComponentInputBinding } from '@angular/router';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { provideIcones } from './core/registrar-icones';

import { authInterceptor } from './core/interceptors/auth.interceptor';
import { routes } from './app.routes';

// Sem isto, os pipes de moeda e data formatam em en-US: "R$1,234.56" e
// "9/14/26" numa interface inteiramente em português.
registerLocaleData(localePt);

export const appConfig: ApplicationConfig = {
  providers: [
    provideZonelessChangeDetection(),
    { provide: LOCALE_ID, useValue: 'pt-BR' },
    provideRouter(routes, withComponentInputBinding()),
    // O interceptor anexa o bearer token e derruba a sessao em 401.
    provideHttpClient(withInterceptors([authInterceptor])),
    provideAnimationsAsync(),
    // Ícones como SVG embutido, sem fonte externa nem CDN.
    provideIcones(),
  ],
};
