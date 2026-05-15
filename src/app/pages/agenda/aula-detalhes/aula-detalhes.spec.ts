import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AulaDetalhes } from './aula-detalhes';

describe('AulaDetalhes', () => {
  let component: AulaDetalhes;
  let fixture: ComponentFixture<AulaDetalhes>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AulaDetalhes]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AulaDetalhes);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
