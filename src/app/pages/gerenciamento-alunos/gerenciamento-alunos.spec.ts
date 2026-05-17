import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GerenciamentoAlunos } from './gerenciamento-alunos';

describe('GerenciamentoAlunos', () => {
  let component: GerenciamentoAlunos;
  let fixture: ComponentFixture<GerenciamentoAlunos>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [GerenciamentoAlunos]
    })
    .compileComponents();

    fixture = TestBed.createComponent(GerenciamentoAlunos);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
