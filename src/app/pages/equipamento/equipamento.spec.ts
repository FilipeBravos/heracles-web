import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Equipamento } from './equipamento';

describe('Equipamento', () => {
  let component: Equipamento;
  let fixture: ComponentFixture<Equipamento>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Equipamento]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Equipamento);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
