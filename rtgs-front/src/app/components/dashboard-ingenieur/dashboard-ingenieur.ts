import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatDividerModule } from '@angular/material/divider';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatChipsModule } from '@angular/material/chips';
import { VisiteService, Visite } from '../../services/visite';
import { RapportService, Rapport } from '../../services/rapport';
import { AuthService } from '../../services/auth';
import { ToastService } from '../../services/toast';
import { forkJoin } from 'rxjs';

interface VisiteAvecRapport extends Visite {
  rapport?: Rapport;
  hasRapport: boolean;
}

@Component({
  selector: 'app-dashboard-ingenieur',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatCardModule,
    MatIconModule,
    MatButtonModule,
    MatDividerModule,
    MatTooltipModule,
    MatChipsModule
  ],
  templateUrl: './dashboard-ingenieur.html',
  styleUrl: './dashboard-ingenieur.scss'
})
export class DashboardIngenieur implements OnInit {

  userId: string = '';
  nomComplet: string = '';

  // Compteurs
  totalVisites: number = 0;
  rapportsBrouillon: number = 0;
  rapportsValides: number = 0;
  rapportsACorrection: number = 0;
  rapportsSoumis: number = 0;

  // Listes
  visitesEnAttenteRapport: VisiteAvecRapport[] = [];
  visitesAvecRapport: VisiteAvecRapport[] = [];
  rapportsUrgents: Rapport[] = []; // À corriger
  visitesPlanifiees: Visite[] = [];

  loading: boolean = true;

  constructor(
    private visiteService: VisiteService,
    private rapportService: RapportService,
    private authService: AuthService,
    private router: Router,
    private toast: ToastService
  ) {}

  ngOnInit(): void {
    this.userId = this.authService.getUserId() || '';
    this.nomComplet = this.authService.getNomComplet();
    this.charger();
  }

  charger(): void {
    this.loading = true;

    forkJoin({
      visites: this.visiteService.getVisitesByIntervenant(this.userId),
      rapports: this.rapportService.getByAuteur(this.userId)
    }).subscribe({
      next: ({ visites, rapports }) => {
        this.totalVisites = visites.length;

        // Compteurs rapports
        this.rapportsBrouillon = rapports.filter(r => r.statut === 'BROUILLON').length;
        this.rapportsValides = rapports.filter(r => r.statut === 'VALIDE').length;
        this.rapportsACorrection = rapports.filter(r => r.statut === 'A_CORRIGER').length;
        this.rapportsSoumis = rapports.filter(r => r.statut === 'SOUMIS').length;

        // Rapports urgents (à corriger)
        this.rapportsUrgents = rapports.filter(r => r.statut === 'A_CORRIGER');

        // Séparer visites planifiées / réalisées
        this.visitesPlanifiees = visites.filter(v => v.statut === 'PLANIFIEE');

        const visitesRealisees = visites.filter(v => v.statut === 'REALISEE');

        // Associer rapports aux visites réalisées
        this.visitesEnAttenteRapport = [];
        this.visitesAvecRapport = [];

        visitesRealisees.forEach(v => {
          const rapport = rapports.find(r => r.visite?.id === v.id);
          const enriched: VisiteAvecRapport = {
            ...v,
            rapport: rapport || undefined,
            hasRapport: !!rapport
          };

          if (rapport) {
            this.visitesAvecRapport.push(enriched);
          } else {
            this.visitesEnAttenteRapport.push(enriched);
          }
        });

        this.loading = false;
      },
      error: () => {
        this.loading = false;
        this.toast.error('Erreur lors du chargement des données.');
      }
    });
  }

  // --- Actions ---

  /** Rédiger un rapport pour une visite spécifique — passe l'ID de la visite en query param */
  redigerRapport(visite: Visite): void {
    this.router.navigate(['/rapports/nouveau'], { queryParams: { visiteId: visite.id } });
  }

  ouvrirRapport(rapport: Rapport): void {
    if (rapport.statut === 'BROUILLON' || rapport.statut === 'A_CORRIGER') {
      this.router.navigate(['/rapports', rapport.id, 'edit']);
    } else {
      this.router.navigate(['/rapports', rapport.id]);
    }
  }

  ouvrirRapportVisite(visite: VisiteAvecRapport): void {
    if (visite.rapport) {
      this.ouvrirRapport(visite.rapport);
    }
  }

  allerRapports(): void {
    this.router.navigate(['/rapports']);
  }

  allerRapportsBrouillons(): void {
    this.router.navigate(['/rapports'], { queryParams: { tab: 1 } });
  }

  allerRapportsSoumis(): void {
    this.router.navigate(['/rapports'], { queryParams: { tab: 2 } });
  }

  allerRapportsValides(): void {
    this.router.navigate(['/rapports'], { queryParams: { tab: 3 } });
  }

  marquerRealisee(visiteId: string): void {
    const today = new Date().toISOString().split('T')[0];
    this.visiteService.marquerRealisee(visiteId, today).subscribe({
      next: () => {
        this.toast.success('Visite marquée comme réalisée.');
        this.charger();
      },
      error: () => {
        this.toast.error('Erreur lors de la mise à jour.');
      }
    });
  }

  // --- Helpers ---

  getStatutRapportLabel(statut: string): string {
    const labels: Record<string, string> = {
      BROUILLON: 'Brouillon', SOUMIS: 'Soumis', VALIDE: 'Validé', A_CORRIGER: 'À corriger'
    };
    return labels[statut] || statut;
  }

  getStatutRapportClass(statut: string): string {
    const classes: Record<string, string> = {
      BROUILLON: 'chip-brouillon', SOUMIS: 'chip-soumis',
      VALIDE: 'chip-valide', A_CORRIGER: 'chip-correction'
    };
    return classes[statut] || '';
  }
}
