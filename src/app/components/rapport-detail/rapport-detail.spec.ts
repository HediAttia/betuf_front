import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RapportDetail } from './rapport-detail';

describe('RapportDetail', () => {
  let component: RapportDetail;
  let fixture: ComponentFixture<RapportDetail>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RapportDetail]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RapportDetail);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
