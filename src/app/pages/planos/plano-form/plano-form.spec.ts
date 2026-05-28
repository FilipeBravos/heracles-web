import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PlanoForm } from './plano-form';

describe('PlanoForm', () => {
  let component: PlanoForm;
  let fixture: ComponentFixture<PlanoForm>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PlanoForm]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PlanoForm);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
