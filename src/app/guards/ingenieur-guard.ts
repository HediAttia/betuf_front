import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth';

export const ingenieurGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  if (!authService.isLoggedIn()) {
    router.navigate(['/login']);
    return false;
  }

  const role = authService.getRole();
  if (role === 'INGENIEUR' || role === 'ADMIN') {
    return true;
  }

  if (role === 'CHARGE_MISSION') {
    router.navigate(['/dashboard']);
  } else if (role === 'EXPLOITANT') {
    router.navigate(['/dashboard-exploitant']);
  } else {
    router.navigate(['/login']);
  }
  return false;
};
