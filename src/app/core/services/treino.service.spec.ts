import { TestBed } from '@angular/core/testing';
import { provideZonelessChangeDetection } from '@angular/core';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';

import { environment } from '../../../environments/environment';
import { TreinoService } from './treino.service';

describe('TreinoService', () => {
  let service: TreinoService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideZonelessChangeDetection(),
        provideHttpClient(),
        provideHttpClientTesting(),
      ],
    });
    service = TestBed.inject(TreinoService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => httpMock.verify());

  it('cria uma ficha via POST — a rota que antes respondia 405', () => {
    service
      .criar({
        nome: 'Ficha C',
        foco: 'Força',
        nivel: 'Avançado',
        exercicios: [
          {
            id: null, nome: 'Agachamento', series: 5,
            repeticoesMin: 5, repeticoesMax: 5, carga: '80% 1RM', observacoes: null,
          },
        ],
      })
      .subscribe();

    const req = httpMock.expectOne(`${environment.apiUrl}/treinos`);
    expect(req.request.method).toBe('POST');
    expect(req.request.body.exercicios.length).toBe(1);
    // A prescrição viaja como números, não como texto livre.
    expect(req.request.body.exercicios[0].series).toBe(5);
    expect(req.request.body.exercicios[0].repeticoesMin).toBe(5);
    expect(req.request.body.exercicios[0].repeticoes).toBeUndefined();
    req.flush({});
  });

  it('pagina a listagem em vez de pedir a base inteira', () => {
    service.listar(2, 50).subscribe();

    const req = httpMock.expectOne(
      (r) => r.url === `${environment.apiUrl}/treinos` && r.params.get('page') === '2'
    );
    expect(req.request.params.get('size')).toBe('50');
    req.flush({ content: [], totalElements: 0, totalPages: 0, number: 2, size: 50, first: true, last: true });
  });

  it('mantém o id dos exercícios existentes ao atualizar', () => {
    // O id é o que permite à API reconciliar em vez de apagar e recriar.
    service
      .atualizar(5, {
        nome: 'Ficha C',
        foco: 'Força',
        nivel: 'Avançado',
        exercicios: [
          {
            id: 6, nome: 'Agachamento', series: 5,
            repeticoesMin: 3, repeticoesMax: 5, carga: null, observacoes: null,
          },
        ],
      })
      .subscribe();

    const req = httpMock.expectOne(`${environment.apiUrl}/treinos/5`);
    expect(req.request.method).toBe('PUT');
    expect(req.request.body.exercicios[0].id).toBe(6);
    req.flush({});
  });
});
