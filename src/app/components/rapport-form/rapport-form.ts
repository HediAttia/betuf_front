import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatChipsModule } from '@angular/material/chips';
import { VisiteService, Visite } from '../../services/visite';
import { RapportService } from '../../services/rapport';
import { AuthService } from '../../services/auth';

interface NonConformite {
  description: string;
  localisation: string;
  criticite: string;
}

@Component({
  selector: 'app-rapport-form',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatIconModule,
    MatSnackBarModule,
    MatChipsModule
  ],
  templateUrl: './rapport-form.html',
  styleUrl: './rapport-form.scss'
})
export class RapportForm implements OnInit {

  visites: Visite[] = [];
  visiteSelectionnee: string = '';
  constats: string = '';
  recommandations: string = '';
  nonConformites: NonConformite[] = [];
  loading: boolean = false;
  userId: string = '';

  niveauxCriticite = ['FAIBLE', 'MODEREE', 'ELEVEE', 'CRITIQUE'];

  constructor(
    private visiteService: VisiteService,
    private rapportService: RapportService,
    private authService: AuthService,
    private router: Router,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.userId = this.authService.getUserId() || '';
    this.visiteService.getVisitesRealiseesByIntervenant(this.userId).subscribe((data: Visite[]) => {
        this.visites = data;
    });
  }

  ajouterNC(): void {
    this.nonConformites.push({
      description: '',
      localisation: '',
      criticite: 'MODEREE'
    });
  }

  supprimerNC(index: number): void {
    this.nonConformites.splice(index, 1);
  }

  sauvegarderBrouillon(): void {
    this.soumettre(false);
  }

  soumettre(soumettre: boolean = true): void {
    if (!this.visiteSelectionnee || !this.constats || !this.recommandations) {
      this.snackBar.open('Veuillez remplir tous les champs obligatoires.', 'Fermer', { duration: 3000 });
      return;
    }

    this.loading = true;
    const body = {
      constats: this.constats,
      recommandations: this.recommandations,
      nonConformites: JSON.stringify(this.nonConformites)
    };

    this.rapportService.creer(this.visiteSelectionnee, this.userId, body).subscribe({
      next: (rapport) => {
        if (soumettre) {
          this.rapportService.soumettre(rapport.id).subscribe({
            next: () => {
              this.loading = false;
              this.snackBar.open('Rapport soumis pour validation !', 'Fermer', { duration: 3000 });
              this.router.navigate(['/rapports']);
            },
            error: () => { this.loading = false; }
          });
        } else {
          this.loading = false;
          this.snackBar.open('Brouillon sauvegardé.', 'Fermer', { duration: 3000 });
          this.router.navigate(['/rapports']);
        }
      },
      error: (err) => {
        this.loading = false;
        this.snackBar.open('Erreur lors de la création du rapport.', 'Fermer', { duration: 3000 });
      }
    });
  }

  annuler(): void {
    this.router.navigate(['/rapports']);
  }
}
