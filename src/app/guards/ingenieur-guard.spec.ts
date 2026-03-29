import { TestBed } from '@angular/core/testing';
import { CanActivateFn } from '@angular/router';

import { ingenieurGuard } from './ingenieur-guard';

describe('ingenieurGuard', () => {
  const executeGuard: CanActivateFn = (...guardParameters) => 
      TestBed.runInInjectionContext(() => ingenieurGuard(...guardParameters));

  beforeEach(() => {
    TestBed.configureTestingModule({});
  });

  it('should be created', () => {
    expect(executeGuard).toBeTruthy();
  });
});
