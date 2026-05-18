import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HistoricoEquipamento } from './historico-equipamento';

describe('HistoricoEquipamento', () => {
  let component: HistoricoEquipamento;
  let fixture: ComponentFixture<HistoricoEquipamento>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HistoricoEquipamento]
    })
    .compileComponents();

    fixture = TestBed.createComponent(HistoricoEquipamento);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
