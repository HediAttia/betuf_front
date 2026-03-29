import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth';

export const chargeMissionGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  if (!authService.isLoggedIn()) {
    router.navigate(['/login']);
    return false;
  }

  const role = authService.getRole();
  if (role === 'CHARGE_MISSION' || role === 'ADMIN') {
    return true;
  }

  // Rediriger vers le bon dashboard selon le rôle
  if (role === 'INGENIEUR') {
    router.navigate(['/dashboard-ingenieur']);
  } else if (role === 'EXPLOITANT') {
    router.navigate(['/dashboard-exploitant']);
  } else {
    router.navigate(['/login']);
  }
  return false;
};
