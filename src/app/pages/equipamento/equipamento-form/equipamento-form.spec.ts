import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EquipamentoForm } from './equipamento-form';

describe('EquipamentoForm', () => {
  let component: EquipamentoForm;
  let fixture: ComponentFixture<EquipamentoForm>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EquipamentoForm]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EquipamentoForm);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
