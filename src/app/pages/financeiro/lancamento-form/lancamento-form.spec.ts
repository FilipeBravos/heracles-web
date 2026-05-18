import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LancamentoForm } from './lancamento-form';

describe('LancamentoForm', () => {
  let component: LancamentoForm;
  let fixture: ComponentFixture<LancamentoForm>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LancamentoForm]
    })
    .compileComponents();

    fixture = TestBed.createComponent(LancamentoForm);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
