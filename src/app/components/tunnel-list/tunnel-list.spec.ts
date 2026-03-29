import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TunnelList } from './tunnel-list';

describe('TunnelList', () => {
  let component: TunnelList;
  let fixture: ComponentFixture<TunnelList>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TunnelList]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TunnelList);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
