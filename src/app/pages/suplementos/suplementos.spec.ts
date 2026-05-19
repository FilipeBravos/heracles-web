import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Suplementos } from './suplementos';

describe('Suplementos', () => {
  let component: Suplementos;
  let fixture: ComponentFixture<Suplementos>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Suplementos]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Suplementos);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
