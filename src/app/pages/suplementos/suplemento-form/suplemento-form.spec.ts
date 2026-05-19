import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SuplementoForm } from './suplemento-form';

describe('SuplementoForm', () => {
  let component: SuplementoForm;
  let fixture: ComponentFixture<SuplementoForm>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SuplementoForm]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SuplementoForm);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
