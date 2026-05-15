import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MeuTreino } from './meu-treino';

describe('MeuTreino', () => {
  let component: MeuTreino;
  let fixture: ComponentFixture<MeuTreino>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MeuTreino]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MeuTreino);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
