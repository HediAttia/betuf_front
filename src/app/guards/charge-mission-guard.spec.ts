import { TestBed } from '@angular/core/testing';
import { CanActivateFn } from '@angular/router';

import { chargeMissionGuard } from './charge-mission-guard';

describe('chargeMissionGuard', () => {
  const executeGuard: CanActivateFn = (...guardParameters) => 
      TestBed.runInInjectionContext(() => chargeMissionGuard(...guardParameters));

  beforeEach(() => {
    TestBed.configureTestingModule({});
  });

  it('should be created', () => {
    expect(executeGuard).toBeTruthy();
  });
});
