import { TestBed } from '@angular/core/testing';
import { provideZonelessChangeDetection } from '@angular/core';
import { HttpClient, provideHttpClient, withInterceptors } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';

import { environment } from '../../../environments/environment';
import { AuthService } from '../services/auth.service';
import { authInterceptor } from './auth.interceptor';

describe('authInterceptor', () => {
  let http: HttpClient;
  let httpMock: HttpTestingController;
  let auth: { token: string | null; encerrarPorTokenInvalido: jasmine.Spy };

  beforeEach(() => {
    auth = {
      token: 'token-de-teste',
      encerrarPorTokenInvalido: jasmine.createSpy('encerrarPorTokenInvalido'),
    };

    TestBed.configureTestingModule({
      providers: [
        provideZonelessChangeDetection(),
        provideHttpClient(withInterceptors([authInterceptor])),
        provideHttpClientTesting(),
        { provide: AuthService, useValue: auth },
      ],
    });

    http = TestBed.inject(HttpClient);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => httpMock.verify());

  it('anexa o bearer token nas chamadas de API', () => {
    http.get(`${environment.apiUrl}/usuarios`).subscribe();

    const req = httpMock.expectOne(`${environment.apiUrl}/usuarios`);
    expect(req.request.headers.get('Authorization')).toBe('Bearer token-de-teste');
    req.flush({});
  });

  it('não envia token para o próprio login', () => {
    http.post(`${environment.apiUrl}/auth/login`, {}).subscribe();

    const req = httpMock.expectOne(`${environment.apiUrl}/auth/login`);
    expect(req.request.headers.has('Authorization')).toBeFalse();
    req.flush({});
  });

  it('derruba a sessão quando a API responde 401', () => {
    http.get(`${environment.apiUrl}/usuarios`).subscribe({ error: () => undefined });

    httpMock
      .expectOne(`${environment.apiUrl}/usuarios`)
      .flush({ detail: 'expirado' }, { status: 401, statusText: 'Unauthorized' });

    expect(auth.encerrarPorTokenInvalido).toHaveBeenCalled();
  });

  it('não derrota a sessão em erros que não sejam 401', () => {
    http.get(`${environment.apiUrl}/usuarios`).subscribe({ error: () => undefined });

    httpMock
      .expectOne(`${environment.apiUrl}/usuarios`)
      .flush({ detail: 'sem permissão' }, { status: 403, statusText: 'Forbidden' });

    expect(auth.encerrarPorTokenInvalido).not.toHaveBeenCalled();
  });
});
