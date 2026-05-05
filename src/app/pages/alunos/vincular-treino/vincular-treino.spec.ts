import { ComponentFixture, TestBed } from '@angular/core/testing';

import { VincularTreino } from './vincular-treino';

describe('VincularTreino', () => {
  let component: VincularTreino;
  let fixture: ComponentFixture<VincularTreino>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [VincularTreino]
    })
    .compileComponents();

    fixture = TestBed.createComponent(VincularTreino);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
