import { TestBed } from '@angular/core/testing';

import { Aluno } from './aluno';

describe('Aluno', () => {
  let service: Aluno;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(Aluno);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
