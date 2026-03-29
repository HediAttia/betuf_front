import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DashboardIngenieur } from './dashboard-ingenieur';

describe('DashboardIngenieur', () => {
  let component: DashboardIngenieur;
  let fixture: ComponentFixture<DashboardIngenieur>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DashboardIngenieur]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DashboardIngenieur);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
