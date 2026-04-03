import { ComponentFixture, TestBed } from '@angular/core/testing';

import { VisiteForm } from './visite-form';

describe('VisiteForm', () => {
  let component: VisiteForm;
  let fixture: ComponentFixture<VisiteForm>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [VisiteForm]
    })
    .compileComponents();

    fixture = TestBed.createComponent(VisiteForm);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
