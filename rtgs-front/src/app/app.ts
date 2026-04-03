import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet, RouterLink, RouterLinkActive, Router, NavigationEnd } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { AuthService } from './services/auth';
import { Subscription } from 'rxjs';
import { filter } from 'rxjs/operators';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterOutlet, RouterLink, RouterLinkActive, MatIconModule, MatTooltipModule],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App implements OnInit, OnDestroy {

  role: string = '';
  initiales: string = '';
  nomComplet: string = '';
  roleLabel: string = '';
  loggedIn: boolean = false;
  sidebarCollapsed: boolean = false;

  private routerSub!: Subscription;

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.refreshUserState();
    this.routerSub = this.router.events.pipe(
      filter(e => e instanceof NavigationEnd)
    ).subscribe(() => {
      this.refreshUserState();
    });
  }

  ngOnDestroy(): void {
    this.routerSub?.unsubscribe();
  }

  isLoggedIn(): boolean {
    return this.loggedIn;
  }

  toggleSidebar(): void {
    this.sidebarCollapsed = !this.sidebarCollapsed;
  }

  private refreshUserState(): void {
    this.loggedIn = this.authService.isLoggedIn();

    if (this.loggedIn) {
      this.role = this.authService.getRole() || '';
      this.nomComplet = this.authService.getNomComplet() || '';

      const parts = this.nomComplet.trim().split(' ').filter(p => p.length > 0);
      this.initiales = parts.map(p => p.charAt(0)).join('').toUpperCase().slice(0, 2);

      switch (this.role) {
        case 'CHARGE_MISSION': this.roleLabel = 'Chargé de mission'; break;
        case 'INGENIEUR': this.roleLabel = 'Ingénieur BETuF'; break;
        case 'EXPLOITANT': this.roleLabel = 'Exploitant'; break;
        default: this.roleLabel = this.role;
      }
    } else {
      this.role = '';
      this.initiales = '';
      this.nomComplet = '';
      this.roleLabel = '';
    }
  }

  logout(): void {
    this.authService.logout();
    this.refreshUserState();
  }
}
