import { TestBed } from '@angular/core/testing';
import { provideZonelessChangeDetection } from '@angular/core';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { Router } from '@angular/router';

import { environment } from '../../../environments/environment';
import { RespostaLogin } from '../models';
import { AuthService } from './auth.service';

describe('AuthService', () => {
  let service: AuthService;
  let httpMock: HttpTestingController;
  let router: jasmine.SpyObj<Router>;

  const resposta: RespostaLogin = {
    token: 'token-de-teste',
    tipo: 'Bearer',
    expiraEmSegundos: 28800,
    usuario: { id: 1, nome: 'Administrador', email: 'admin@heracles.com.br', tipoPerfil: 'ADMIN' },
  };

  beforeEach(() => {
    router = jasmine.createSpyObj<Router>('Router', ['navigate']);
    router.navigate.and.returnValue(Promise.resolve(true));

    TestBed.configureTestingModule({
      providers: [
        provideZonelessChangeDetection(),
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: Router, useValue: router },
      ],
    });

    localStorage.clear();
    service = TestBed.inject(AuthService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
    localStorage.clear();
  });

  it('começa deslogado quando não há sessão salva', () => {
    expect(service.autenticado()).toBeFalse();
    expect(service.usuario()).toBeNull();
  });

  it('envia as credenciais para /auth/login e guarda a sessão', () => {
    // A versão anterior ignorava e-mail e senha e fazia GET /usuarios.
    service.login({ email: 'admin@heracles.com.br', senha: 'Heracles@2026' }).subscribe();

    const req = httpMock.expectOne(`${environment.apiUrl}/auth/login`);
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual({ email: 'admin@heracles.com.br', senha: 'Heracles@2026' });
    req.flush(resposta);

    expect(service.autenticado()).toBeTrue();
    expect(service.token).toBe('token-de-teste');
    expect(service.usuario()?.nome).toBe('Administrador');
    expect(service.ehAdmin()).toBeTrue();
  });

  it('limpa a sessão e volta para o login ao sair', () => {
    service.login({ email: 'admin@heracles.com.br', senha: 'Heracles@2026' }).subscribe();
    httpMock.expectOne(`${environment.apiUrl}/auth/login`).flush(resposta);

    service.logout();

    expect(service.autenticado()).toBeFalse();
    expect(service.token).toBeNull();
    expect(router.navigate).toHaveBeenCalledWith(['/login']);
  });
});
