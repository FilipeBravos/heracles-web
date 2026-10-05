import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DashboardAdministrativo } from './dashboard-administrativo';

describe('DashboardAdministrativo', () => {
  let component: DashboardAdministrativo;
  let fixture: ComponentFixture<DashboardAdministrativo>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DashboardAdministrativo]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DashboardAdministrativo);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
