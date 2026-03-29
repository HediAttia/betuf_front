import { Component } from '@angular/core';
import { RouterOutlet, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { AuthService } from './services/auth';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    RouterOutlet,
    RouterModule,
    CommonModule,
    MatToolbarModule,
    MatButtonModule,
    MatIconModule,
    MatTooltipModule
  ],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App {
  title = 'rtgs-front';

  constructor(private authService: AuthService) {}

  isLoggedIn(): boolean {
    return this.authService.isLoggedIn();
  }

  get nomComplet(): string {
    return this.authService.getNomComplet();
  }

  get role(): string {
    return this.authService.getRole() || '';
  }

  get initiales(): string {
    return this.nomComplet.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
  }

  get roleLabel(): string {
    switch(this.role) {
      case 'CHARGE_MISSION': return 'Chargé de mission';
      case 'INGENIEUR': return 'Ingénieur terrain';
      case 'EXPLOITANT': return 'Exploitant';
      default: return '';
    }
  }

  logout(): void {
    this.authService.logout();
  }
}
