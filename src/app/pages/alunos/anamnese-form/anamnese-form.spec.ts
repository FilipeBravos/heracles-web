import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AnamneseForm } from './anamnese-form';

describe('AnamneseForm', () => {
  let component: AnamneseForm;
  let fixture: ComponentFixture<AnamneseForm>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AnamneseForm]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AnamneseForm);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
