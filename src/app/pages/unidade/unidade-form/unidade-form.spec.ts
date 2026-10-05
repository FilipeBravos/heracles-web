import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UnidadeForm } from './unidade-form';

describe('UnidadeForm', () => {
  let component: UnidadeForm;
  let fixture: ComponentFixture<UnidadeForm>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UnidadeForm]
    })
    .compileComponents();

    fixture = TestBed.createComponent(UnidadeForm);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
