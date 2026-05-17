import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AtribuirAluno } from './atribuir-aluno';

describe('AtribuirAluno', () => {
  let component: AtribuirAluno;
  let fixture: ComponentFixture<AtribuirAluno>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AtribuirAluno]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AtribuirAluno);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
