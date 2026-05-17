import { ApplicationConfig, provideZonelessChangeDetection, LOCALE_ID } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient, withInterceptors } from '@angular/common/http'; 
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { registerLocaleData } from '@angular/common';
import localePt from '@angular/common/locales/pt';
import { routes } from './app.routes';
import { authInterceptor } from './core/interceptors/auth.interceptor'; 

registerLocaleData(localePt);

export const appConfig: ApplicationConfig = {
  providers: [
    provideZonelessChangeDetection(), 
    
    provideRouter(routes), 
    
    provideHttpClient(withInterceptors([authInterceptor])), 
    
    provideAnimationsAsync(),

    { provide: LOCALE_ID, useValue: 'pt-BR' }
  ]
};