import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AulaAlunos } from './aula-alunos';

describe('AulaAlunos', () => {
  let component: AulaAlunos;
  let fixture: ComponentFixture<AulaAlunos>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AulaAlunos]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AulaAlunos);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
