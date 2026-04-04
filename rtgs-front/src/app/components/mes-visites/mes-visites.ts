import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatChipsModule } from '@angular/material/chips';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatTabsModule } from '@angular/material/tabs';
import { VisiteService, Visite } from '../../services/visite';
import { RapportService, Rapport } from '../../services/rapport';
import { AuthService } from '../../services/auth';
import { ToastService } from '../../services/toast';
import { forkJoin } from 'rxjs';

@Component({
  selector: 'app-mes-visites',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatCardModule,
    MatIconModule,
    MatButtonModule,
    MatChipsModule,
    MatTooltipModule,
    MatTabsModule
  ],
  templateUrl: './mes-visites.html',
  styleUrl: './mes-visites.scss'
})
export class MesVisites implements OnInit {

  userId: string = '';
  visites: Visite[] = [];
  rapports: Rapport[] = [];
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
    this.charger();
  }

  charger(): void {
    this.loading = true;
    forkJoin({
      visites: this.visiteService.getVisitesByIntervenant(this.userId),
      rapports: this.rapportService.getByAuteur(this.userId)
    }).subscribe({
      next: ({ visites, rapports }) => {
        this.visites = visites.sort((a, b) =>
          new Date(b.datePrevisionnelle).getTime() - new Date(a.datePrevisionnelle).getTime()
        );
        this.rapports = rapports;
        this.loading = false;
      },
      error: () => {
        this.loading = false;
        this.toast.error('Erreur lors du chargement.');
      }
    });
  }

  get visitesPlanifiees(): Visite[] {
    return this.visites.filter(v => v.statut === 'PLANIFIEE');
  }

  get visitesRealisees(): Visite[] {
    return this.visites.filter(v => v.statut === 'REALISEE');
  }

  get visitesCloturees(): Visite[] {
    return this.visites.filter(v => v.statut === 'CLOTUREE');
  }

  getRapportForVisite(visiteId: string): Rapport | undefined {
    return this.rapports.find(r => r.visite?.id === visiteId);
  }

  // Actions
  voirTunnel(visite: Visite): void {
    const tunnelId = visite.tunnelId || visite.tunnel?.id;
    if (tunnelId) {
      this.router.navigate(['/tunnels', tunnelId]);
    }
  }

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

  marquerRealisee(visiteId: string): void {
    const today = new Date().toISOString().split('T')[0];
    this.visiteService.marquerRealisee(visiteId, today).subscribe({
      next: () => {
        this.toast.success('Visite marquée comme réalisée.');
        this.charger();
      },
      error: () => this.toast.error('Erreur lors de la mise à jour.')
    });
  }

  // Helpers
  getStatutLabel(statut: string): string {
    const labels: Record<string, string> = {
      PLANIFIEE: 'Planifiée', REALISEE: 'Réalisée',
      CLOTUREE: 'Clôturée', ANNULEE: 'Annulée'
    };
    return labels[statut] || statut;
  }

  getStatutClass(statut: string): string {
    const classes: Record<string, string> = {
      PLANIFIEE: 'statut-planifiee', REALISEE: 'statut-realisee',
      CLOTUREE: 'statut-cloturee', ANNULEE: 'statut-annulee'
    };
    return classes[statut] || '';
  }

  getRapportStatutLabel(rapport: Rapport | undefined): string {
    if (!rapport) return '—';
    const labels: Record<string, string> = {
      BROUILLON: 'Brouillon', SOUMIS: 'En validation',
      VALIDE: 'Validé', A_CORRIGER: 'À corriger'
    };
    return labels[rapport.statut] || rapport.statut;
  }

  getRapportStatutClass(rapport: Rapport | undefined): string {
    if (!rapport) return '';
    const classes: Record<string, string> = {
      BROUILLON: 'rapport-brouillon', SOUMIS: 'rapport-soumis',
      VALIDE: 'rapport-valide', A_CORRIGER: 'rapport-correction'
    };
    return classes[rapport.statut] || '';
  }
}
