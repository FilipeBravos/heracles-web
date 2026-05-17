import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DashboardAluno } from './dashboard-aluno';

describe('DashboardAluno', () => {
  let component: DashboardAluno;
  let fixture: ComponentFixture<DashboardAluno>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DashboardAluno]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DashboardAluno);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
