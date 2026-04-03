import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RapportList } from './rapport-list';

describe('RapportList', () => {
  let component: RapportList;
  let fixture: ComponentFixture<RapportList>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RapportList]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RapportList);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
