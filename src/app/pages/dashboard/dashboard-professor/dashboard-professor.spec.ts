import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DashboardProfessor } from './dashboard-professor';

describe('DashboardProfessor', () => {
  let component: DashboardProfessor;
  let fixture: ComponentFixture<DashboardProfessor>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DashboardProfessor]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DashboardProfessor);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
