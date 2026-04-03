import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatChipsModule } from '@angular/material/chips';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatDividerModule } from '@angular/material/divider';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { RapportService, Rapport } from '../../services/rapport';

@Component({
  selector: 'app-rapport-detail',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatCardModule,
    MatChipsModule,
    MatIconModule,
    MatButtonModule,
    MatDividerModule,
    MatTooltipModule,
    MatSnackBarModule
  ],
  templateUrl: './rapport-detail.html',
  styleUrl: './rapport-detail.scss'
})
export class RapportDetail implements OnInit {

  rapport: Rapport | null = null;
  nonConformites: any[] = [];

  // IDs de démo
  dupont_id = 'b1000000-0000-0000-0000-000000000001';

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private rapportService: RapportService,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.charger(id);
    }
  }

  charger(id: string): void {
    this.rapportService.getById(id).subscribe((data: Rapport) => {
      this.rapport = data;
      if (data.nonConformites) {
        try {
          this.nonConformites = JSON.parse(data.nonConformites);
        } catch {
          this.nonConformites = [];
        }
      }
    });
  }

  valider(): void {
    if (!this.rapport) return;
    this.rapportService.valider(this.rapport.id, this.dupont_id).subscribe({
      next: () => {
        this.snackBar.open('Rapport validé avec succès !', 'Fermer', { duration: 3000, panelClass: 'snack-success' });
        this.charger(this.rapport!.id);
      },
      error: (err) => {
        this.snackBar.open('Validation refusée — RG-VAL-03', 'Fermer', { duration: 4000, panelClass: 'snack-error' });
      }
    });
  }

  corriger(): void {
    if (!this.rapport) return;
    const commentaire = prompt('Commentaire de correction (obligatoire) :');
    if (commentaire && commentaire.length >= 20) {
      this.rapportService.corriger(this.rapport.id, commentaire).subscribe({
        next: () => {
          this.snackBar.open('Rapport retourné pour correction.', 'Fermer', { duration: 3000 });
          this.charger(this.rapport!.id);
        },
        error: (err) => console.error(err)
      });
    } else if (commentaire) {
      this.snackBar.open('Commentaire trop court — 20 caractères minimum.', 'Fermer', { duration: 3000 });
    }
  }

  retour(): void {
    this.router.navigate(['/rapports']);
  }

  getStatutColor(statut: string): string {
    switch(statut) {
      case 'SOUMIS': return 'primary';
      case 'A_CORRIGER': return 'warn';
      case 'VALIDE': return 'accent';
      default: return '';
    }
  }

  getCriticiteColor(criticite: string): string {
    switch(criticite) {
      case 'CRITIQUE': return 'warn';
      case 'MODEREE': return 'accent';
      case 'FAIBLE': return 'primary';
      default: return '';
    }
  }
}
