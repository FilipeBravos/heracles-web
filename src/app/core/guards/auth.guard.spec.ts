import { TestBed } from '@angular/core/testing';
import { provideZonelessChangeDetection } from '@angular/core';
import { Router, UrlTree } from '@angular/router';

import { AuthService } from '../services/auth.service';
import { authGuard, visitanteGuard } from './auth.guard';

describe('authGuard', () => {
  let autenticado: boolean;

  function executar(guard: typeof authGuard, url = '/dashboard/alunos') {
    return TestBed.runInInjectionContext(() =>
      guard({} as never, { url } as never)
    );
  }

  beforeEach(() => {
    autenticado = false;
    TestBed.configureTestingModule({
      providers: [
        provideZonelessChangeDetection(),
        { provide: AuthService, useValue: { autenticado: () => autenticado } },
        {
          provide: Router,
          useValue: {
            createUrlTree: (comandos: unknown[], extras: unknown) =>
              ({ comandos, extras }) as unknown as UrlTree,
          },
        },
      ],
    });
  });

  it('bloqueia o dashboard para visitante e leva ao login', () => {
    // Antes não havia guarda nenhuma: /dashboard abria para qualquer um.
    const resultado = executar(authGuard) as unknown as { comandos: unknown[]; extras: { queryParams: { redirecionar: string } } };

    expect(resultado.comandos).toEqual(['/login']);
    expect(resultado.extras.queryParams.redirecionar).toBe('/dashboard/alunos');
  });

  it('libera o dashboard para usuário autenticado', () => {
    autenticado = true;
    expect(executar(authGuard)).toBeTrue();
  });

  it('manda quem já está logado de volta ao dashboard na tela de login', () => {
    autenticado = true;
    const resultado = executar(visitanteGuard, '/login') as unknown as { comandos: unknown[] };
    expect(resultado.comandos).toEqual(['/dashboard']);
  });

  it('deixa visitante ver a tela de login', () => {
    expect(executar(visitanteGuard, '/login')).toBeTrue();
  });
});
