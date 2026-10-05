import { TestBed } from '@angular/core/testing';
import { provideZonelessChangeDetection } from '@angular/core';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';

import { environment } from '../../../environments/environment';
import { UsuarioService } from './usuario.service';

describe('UsuarioService', () => {
  let service: UsuarioService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideZonelessChangeDetection(),
        provideHttpClient(),
        provideHttpClientTesting(),
      ],
    });
    service = TestBed.inject(UsuarioService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => httpMock.verify());

  it('envia a senha em claro para a API cifrar, sem montar hash no cliente', () => {
    service
      .criar({
        nome: 'Maria Silva',
        cpf: '123.456.789-01',
        email: 'maria@email.com',
        telefone: null,
        tipoPerfil: 'ALUNO',
        senha: 'SenhaForte123',
      })
      .subscribe();

    const req = httpMock.expectOne(`${environment.apiUrl}/usuarios`);
    // O formulário costumava enviar senhaHash: '123456' como texto literal.
    expect(req.request.body.senhaHash).toBeUndefined();
    expect(req.request.body.senha).toBe('SenhaForte123');
    req.flush({});
  });

  it('envia os vínculos de treino no envelope que a API espera', () => {
    service.sincronizarTreinos(1, [3, 5]).subscribe();

    const req = httpMock.expectOne(`${environment.apiUrl}/usuarios/1/treinos`);
    expect(req.request.method).toBe('PUT');
    expect(req.request.body).toEqual({ treinosIds: [3, 5] });
    req.flush({});
  });

  it('permite desvincular todas as fichas com uma lista vazia', () => {
    service.sincronizarTreinos(1, []).subscribe();

    const req = httpMock.expectOne(`${environment.apiUrl}/usuarios/1/treinos`);
    expect(req.request.body).toEqual({ treinosIds: [] });
    req.flush({});
  });

  it('busca a anamnese do aluno', () => {
    service.buscarAnamnese(1).subscribe();

    const req = httpMock.expectOne(`${environment.apiUrl}/usuarios/1/anamnese`);
    expect(req.request.method).toBe('GET');
    req.flush({ preenchida: false });
  });

  it('salva a anamnese do aluno', () => {
    service
      .salvarAnamnese(1, {
        objetivo: 'Hipertrofia',
        condicoesSaude: null,
        lesoesCirurgias: null,
        medicamentosUso: null,
        restricoesMedicas: null,
        contatoEmergenciaNome: 'Joana',
        contatoEmergenciaTelefone: '(11) 91234-5678',
      })
      .subscribe();

    const req = httpMock.expectOne(`${environment.apiUrl}/usuarios/1/anamnese`);
    expect(req.request.method).toBe('PUT');
    expect(req.request.body.objetivo).toBe('Hipertrofia');
    req.flush({ preenchida: true });
  });

  it('busca a foto como blob, não como JSON', () => {
    service.buscarFoto(1).subscribe();

    const req = httpMock.expectOne(`${environment.apiUrl}/usuarios/1/foto`);
    expect(req.request.method).toBe('GET');
    expect(req.request.responseType).toBe('blob');
    req.flush(new Blob());
  });
});
