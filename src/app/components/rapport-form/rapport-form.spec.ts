import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RapportForm } from './rapport-form';

describe('RapportForm', () => {
  let component: RapportForm;
  let fixture: ComponentFixture<RapportForm>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RapportForm]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RapportForm);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
