import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TreinoDetalhes } from './treino-detalhes';

describe('TreinoDetalhes', () => {
  let component: TreinoDetalhes;
  let fixture: ComponentFixture<TreinoDetalhes>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TreinoDetalhes]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TreinoDetalhes);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
