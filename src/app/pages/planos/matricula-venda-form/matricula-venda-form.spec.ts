import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MatriculaVendaForm } from './matricula-venda-form';

describe('MatriculaVendaForm', () => {
  let component: MatriculaVendaForm;
  let fixture: ComponentFixture<MatriculaVendaForm>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MatriculaVendaForm]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MatriculaVendaForm);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
