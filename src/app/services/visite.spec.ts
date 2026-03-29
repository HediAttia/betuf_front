import { TestBed } from '@angular/core/testing';

import { Visite } from './visite';

describe('Visite', () => {
  let service: Visite;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(Visite);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
