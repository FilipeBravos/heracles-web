import { TestBed } from '@angular/core/testing';
import { provideZonelessChangeDetection } from '@angular/core';

import { TemaService } from './tema.service';

describe('TemaService', () => {
  let service: TemaService;

  beforeEach(() => {
    localStorage.clear();
    document.documentElement.style.colorScheme = '';

    TestBed.configureTestingModule({
      providers: [provideZonelessChangeDetection()],
    });
  });

  afterEach(() => {
    localStorage.clear();
    document.documentElement.style.colorScheme = '';
  });

  it('começa em claro quando não há preferência salva', () => {
    service = TestBed.inject(TemaService);

    expect(service.tema()).toBe('claro');
    expect(document.documentElement.style.colorScheme).toBe('light');
  });

  it('lê a preferência salva de uma sessão anterior', () => {
    localStorage.setItem('heracles.tema', 'escuro');

    service = TestBed.inject(TemaService);

    expect(service.tema()).toBe('escuro');
    expect(document.documentElement.style.colorScheme).toBe('dark');
  });

  it('escreve color-scheme em <html>, não numa classe — é isso que os tokens light-dark() leem', () => {
    service = TestBed.inject(TemaService);

    service.definir('escuro');
    expect(document.documentElement.style.colorScheme).toBe('dark');

    service.definir('sistema');
    // "light dark": o navegador escolhe conforme o sistema operacional,
    // e não o app.
    expect(document.documentElement.style.colorScheme).toBe('light dark');

    service.definir('claro');
    expect(document.documentElement.style.colorScheme).toBe('light');
  });

  it('a escolha sobrevive a uma nova instância, como um recarregamento de página', () => {
    service = TestBed.inject(TemaService);
    service.definir('escuro');

    const novaInstancia = new TemaService();

    expect(novaInstancia.tema()).toBe('escuro');
  });
});
