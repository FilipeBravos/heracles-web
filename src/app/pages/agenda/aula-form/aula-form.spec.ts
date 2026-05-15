import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AulaForm } from './aula-form';

describe('AulaForm', () => {
  let component: AulaForm;
  let fixture: ComponentFixture<AulaForm>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AulaForm]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AulaForm);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
