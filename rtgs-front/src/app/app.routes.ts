import { Routes } from '@angular/router';
import { DashboardComponent } from './components/dashboard/dashboard';
import { TunnelList } from './components/tunnel-list/tunnel-list';
import { TunnelDetail } from './components/tunnel-detail/tunnel-detail';
import { RapportList } from './components/rapport-list/rapport-list';
import { RapportDetail } from './components/rapport-detail/rapport-detail';
import { LoginComponent } from './components/login/login';
import { DashboardIngenieur } from './components/dashboard-ingenieur/dashboard-ingenieur';
import { DashboardExploitant } from './components/dashboard-exploitant/dashboard-exploitant';
import { authGuard } from './guards/auth-guard';
import { chargeMissionGuard } from './guards/charge-mission-guard';
import { ingenieurGuard } from './guards/ingenieur-guard';
import { RapportForm } from './components/rapport-form/rapport-form';

export const routes: Routes = [
  { path: 'login', component: LoginComponent },
  { path: '', redirectTo: 'login', pathMatch: 'full' },

  // Chargé de mission uniquement
  { path: 'dashboard', component: DashboardComponent, canActivate: [chargeMissionGuard] },
  { path: 'tunnels', component: TunnelList, canActivate: [chargeMissionGuard] },
  { path: 'tunnels/:id', component: TunnelDetail, canActivate: [chargeMissionGuard] },

  // Ingénieur uniquement
  { path: 'dashboard-ingenieur', component: DashboardIngenieur, canActivate: [ingenieurGuard] },

  // Exploitant
  { path: 'dashboard-exploitant', component: DashboardExploitant, canActivate: [authGuard] },

  // Rapports — ORDRE IMPORTANT : routes fixes AVANT les paramétrisées
  { path: 'rapports', component: RapportList, canActivate: [authGuard] },
  { path: 'rapports/nouveau', component: RapportForm, canActivate: [ingenieurGuard] },
  { path: 'rapports/:id/edit', component: RapportForm, canActivate: [ingenieurGuard] },
  { path: 'rapports/:id', component: RapportDetail, canActivate: [authGuard] },

  { path: '**', redirectTo: 'login' }
];
