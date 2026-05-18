import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ManutencaoForm } from './manutencao-form';

describe('ManutencaoForm', () => {
  let component: ManutencaoForm;
  let fixture: ComponentFixture<ManutencaoForm>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ManutencaoForm]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ManutencaoForm);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
