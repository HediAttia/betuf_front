import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatChipsModule } from '@angular/material/chips';
import { VisiteService, Visite } from '../../services/visite';
import { RapportService, Rapport } from '../../services/rapport';
import { AuthService } from '../../services/auth';

interface NonConformite {
  description: string;
  localisation: string;
  criticite: string;
}

interface PhotoTerrain {
  fichier: File;
  preview: string;
  nom: string;
  localisation: string;
  typeZone: string;
  datePrise: string;
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
export class RapportForm implements OnInit, OnDestroy {

  // Mode édition
  rapportId: string | null = null;
  rapportExistant: Rapport | null = null;
  modeEdition: boolean = false;
  commentaireCorrection: string = '';

  visites: Visite[] = [];
  visiteSelectionnee: string = '';
  constats: string = '';
  recommandations: string = '';
  nonConformites: NonConformite[] = [];
  loading: boolean = false;
  userId: string = '';

  // RG-RAP-05 — Photos avec métadonnées
  photos: PhotoTerrain[] = [];
  typesZone = ['Voûte', 'Piédroit gauche', 'Piédroit droit', 'Radier', 'Tête amont', 'Tête aval', 'Galerie de secours', 'Autre'];

  // RG-RAP-07 — Sauvegarde automatique toutes les 2 min
  private autoSaveTimer: any;
  private rapportBrouillonId: string | null = null;
  derniereSauvegarde: Date | null = null;
  autoSaveStatut: string = '';

  niveauxCriticite = ['FAIBLE', 'MODEREE', 'ELEVEE', 'CRITIQUE'];

  constructor(
    private visiteService: VisiteService,
    private rapportService: RapportService,
    private authService: AuthService,
    private router: Router,
    private route: ActivatedRoute,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.userId = this.authService.getUserId() || '';

    this.rapportId = this.route.snapshot.paramMap.get('id');
    this.modeEdition = !!this.rapportId;

    if (this.modeEdition && this.rapportId) {
      this.rapportBrouillonId = this.rapportId;
      this.chargerRapport(this.rapportId);
    } else {
      this.chargerVisites();
    }

    // RG-RAP-07 : démarrer la sauvegarde automatique toutes les 2 minutes
    this.autoSaveTimer = setInterval(() => {
      this.autoSauvegarder();
    }, 2 * 60 * 1000);
  }

  ngOnDestroy(): void {
    if (this.autoSaveTimer) {
      clearInterval(this.autoSaveTimer);
    }
  }

  chargerRapport(id: string): void {
    this.rapportService.getById(id).subscribe((rapport: Rapport) => {
      this.rapportExistant = rapport;
      this.constats = rapport.constats || '';
      this.recommandations = rapport.recommandations || '';
      this.commentaireCorrection = rapport.commentaireRejet || '';
      this.visiteSelectionnee = rapport.visite?.id || '';

      if (rapport.nonConformites) {
        try {
          this.nonConformites = JSON.parse(rapport.nonConformites);
        } catch {
          this.nonConformites = [];
        }
      }
    });
  }

  chargerVisites(): void {
    this.visiteService.getVisitesRealiseesByIntervenant(this.userId).subscribe((data: Visite[]) => {
      this.visites = data;
    });
  }

  // ── Auto-save RG-RAP-07 ──────────────────────────────────────────────
  autoSauvegarder(): void {
    if (!this.constats && !this.recommandations) return;

    const body = {
      constats: this.constats,
      recommandations: this.recommandations,
      nonConformites: JSON.stringify(this.nonConformites)
    };

    if (this.rapportBrouillonId) {
      // Mise à jour du brouillon existant
      this.rapportService.modifier(this.rapportBrouillonId, body).subscribe({
        next: () => {
          this.derniereSauvegarde = new Date();
          this.autoSaveStatut = 'Sauvegarde automatique — ' + this.derniereSauvegarde.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
        },
        error: () => {}
      });
    } else if (this.visiteSelectionnee) {
      // Première sauvegarde automatique : création du brouillon
      this.rapportService.creer(this.visiteSelectionnee, this.userId, body).subscribe({
        next: (rapport) => {
          this.rapportBrouillonId = rapport.id;
          this.derniereSauvegarde = new Date();
          this.autoSaveStatut = 'Sauvegarde automatique — ' + this.derniereSauvegarde.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
        },
        error: () => {}
      });
    }
  }

  // ── Photos RG-RAP-05 ──────────────────────────────────────────────────
  ajouterPhoto(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (!input.files || input.files.length === 0) return;

    const file = input.files[0];
    const reader = new FileReader();
    reader.onload = (e) => {
      const today = new Date().toISOString().split('T')[0];
      this.photos.push({
        fichier: file,
        preview: e.target?.result as string,
        nom: file.name,
        localisation: '',
        typeZone: '',
        datePrise: today
      });
    };
    reader.readAsDataURL(file);
    input.value = '';
  }

  supprimerPhoto(index: number): void {
    this.photos.splice(index, 1);
  }

  // ── Non-conformités ───────────────────────────────────────────────────
  ajouterNC(): void {
    this.nonConformites.push({ description: '', localisation: '', criticite: 'MODEREE' });
  }

  supprimerNC(index: number): void {
    this.nonConformites.splice(index, 1);
  }

  // ── Sauvegarde manuelle ───────────────────────────────────────────────
  sauvegarderBrouillon(): void {
    if (this.modeEdition || this.rapportBrouillonId) {
      this.modifierRapport(false);
    } else {
      this.soumettre(false);
    }
  }

  soumettre(soumettre: boolean = true): void {
    if (this.modeEdition || this.rapportBrouillonId) {
      this.modifierRapport(soumettre);
      return;
    }

    if (!this.visiteSelectionnee || !this.constats || !this.recommandations) {
      this.snackBar.open('Veuillez remplir tous les champs obligatoires.', 'Fermer', { duration: 3000 });
      return;
    }

    if (soumettre && this.photos.length === 0) {
      this.snackBar.open('RG-RAP-05 : Au moins une photo avec localisation est requise avant soumission.', 'Fermer', { duration: 4000 });
      return;
    }

    this.loading = true;
    const body = {
      constats: this.constats,
      recommandations: this.recommandations,
      nonConformites: JSON.stringify(this.nonConformites)
    };

    const idBrouillon = this.rapportBrouillonId;

    if (idBrouillon) {
      // Brouillon auto-créé existe déjà : juste soumettre
      if (soumettre) {
        this.rapportService.soumettre(idBrouillon).subscribe({
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
      return;
    }

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
      error: () => {
        this.loading = false;
        this.snackBar.open('Erreur lors de la création du rapport.', 'Fermer', { duration: 3000 });
      }
    });
  }

  modifierRapport(soumettre: boolean): void {
    if (!this.constats || !this.recommandations) {
      this.snackBar.open('Veuillez remplir tous les champs obligatoires.', 'Fermer', { duration: 3000 });
      return;
    }

    if (soumettre && this.photos.length === 0) {
      this.snackBar.open('RG-RAP-05 : Au moins une photo avec localisation est requise avant soumission.', 'Fermer', { duration: 4000 });
      return;
    }

    this.loading = true;
    const id = this.rapportId || this.rapportBrouillonId!;
    const body = {
      constats: this.constats,
      recommandations: this.recommandations,
      nonConformites: JSON.stringify(this.nonConformites)
    };

    this.rapportService.modifier(id, body).subscribe({
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
      error: () => {
        this.loading = false;
        this.snackBar.open('Erreur lors de la modification du rapport.', 'Fermer', { duration: 3000 });
      }
    });
  }

  annuler(): void {
    this.router.navigate(['/rapports']);
  }
}
