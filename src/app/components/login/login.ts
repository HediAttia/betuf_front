import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDividerModule } from '@angular/material/divider';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { AuthService } from '../../services/auth';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatDividerModule,
    MatProgressSpinnerModule
  ],
  templateUrl: './login.html',
  styleUrl: './login.scss'
})
export class LoginComponent {

  email: string = '';
  password: string = '';
  showPassword: boolean = false;
  loading: boolean = false;
  erreur: string = '';

  comptesDemo = [
    { label: 'André Dupont — Chargé de mission', email: 'a.dupont@betuf.fr', password: 'Dupont2026!' },
    { label: 'Jean-Pierre Martin — Ingénieur', email: 'jp.martin@betuf.fr', password: 'Martin2026!' },
    { label: 'Claire Bernard — Chargée de mission', email: 'c.bernard@betuf.fr', password: 'Bernard2026!' },
    { label: 'Pierre Renault — Exploitant', email: 'p.renault@diralpes.fr', password: 'Renault2026!' }
  ];

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  selectionnerCompte(email: string, password: string): void {
    this.email = email;
    this.password = password;
  }

  login(): void {
    if (!this.email || !this.password) {
      this.erreur = 'Veuillez remplir tous les champs.';
      return;
    }

    this.loading = true;
    this.erreur = '';

    this.authService.login(this.email, this.password).subscribe({
      next: (response) => {
        this.loading = false;
        switch (response.role) {
          case 'CHARGE_MISSION':
            this.router.navigate(['/dashboard']);
            break;
          case 'INGENIEUR':
            this.router.navigate(['/dashboard-ingenieur']);
            break;
          case 'EXPLOITANT':
            this.router.navigate(['/dashboard-exploitant']);
            break;
          default:
            this.router.navigate(['/dashboard']);
        }
      },
      error: () => {
        this.loading = false;
        this.erreur = 'Email ou mot de passe incorrect.';
      }
    });
  }
}
