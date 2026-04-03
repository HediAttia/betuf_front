import { TestBed } from '@angular/core/testing';

import { Tunnel } from './tunnel';

describe('Tunnel', () => {
  let service: Tunnel;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(Tunnel);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
