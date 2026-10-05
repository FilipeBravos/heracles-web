import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Unidade } from './unidade';

describe('Unidade', () => {
  let component: Unidade;
  let fixture: ComponentFixture<Unidade>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Unidade]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Unidade);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
