import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatChipsModule } from '@angular/material/chips';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatTabsModule } from '@angular/material/tabs';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { VisiteService, Visite } from '../../services/visite';
import { RapportService, Rapport } from '../../services/rapport';
import { AuthService } from '../../services/auth';
import { forkJoin } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { of } from 'rxjs';

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
    MatTabsModule,
    MatSnackBarModule
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
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.userId = this.authService.getUserId() || '';
    this.charger();
  }

  charger(): void {
    this.loading = true;
    forkJoin({
      visites: this.visiteService.getVisitesByIntervenant(this.userId).pipe(catchError(() => of([]))),
      rapports: this.rapportService.getByAuteur(this.userId).pipe(catchError(() => of([])))
    }).subscribe({
      next: ({ visites, rapports }) => {
        this.visites = (visites as Visite[]).sort((a, b) =>
          new Date(b.datePrevisionnelle).getTime() - new Date(a.datePrevisionnelle).getTime()
        );
        this.rapports = rapports as Rapport[];
        this.loading = false;
      },
      error: () => {
        this.loading = false;
        this.snackBar.open('Erreur lors du chargement des visites.', 'Fermer', { duration: 3000 });
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

  voirTunnel(visite: Visite): void {
    const tunnelId = (visite as any).tunnelId || visite.tunnel?.id;
    if (tunnelId) {
      this.router.navigate(['/tunnels', tunnelId]);
    }
  }

  redigerRapport(visite: Visite): void {
    this.router.navigate(['/rapports/nouveau'], { queryParams: { visiteId: visite.id } });
  }

  ouvrirRapport(rapport: Rapport): void {
    if (rapport.statut === 'BROUILLON' || rapport.statut === 'A_CORRIGER') {
      this.router.navigate(['/rapports', rapport.id, 'modifier']);
    } else {
      this.router.navigate(['/rapports', rapport.id]);
    }
  }

  marquerRealisee(visiteId: string): void {
    const today = new Date().toISOString().split('T')[0];
    this.visiteService.marquerRealisee(visiteId, today).subscribe({
      next: () => {
        this.snackBar.open('Visite marquée comme réalisée.', 'Fermer', { duration: 3000 });
        this.charger();
      },
      error: () => this.snackBar.open('Erreur lors de la mise à jour.', 'Fermer', { duration: 3000 })
    });
  }

  getStatutLabel(statut: string): string {
    const labels: Record<string, string> = {
      PLANIFIEE: 'Planifiée', REALISEE: 'Réalisée', CLOTUREE: 'Clôturée', ANNULEE: 'Annulée'
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
      BROUILLON: 'Brouillon', SOUMIS: 'En validation', VALIDE: 'Validé', A_CORRIGER: 'À corriger'
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

  getTunnelNom(visite: Visite): string {
    return visite.tunnel?.nom || (visite as any).tunnelNom || 'Tunnel';
  }

  getTunnelLoc(visite: Visite): string {
    return visite.tunnel?.localisation || (visite as any).tunnelLocalisation || '';
  }
}
