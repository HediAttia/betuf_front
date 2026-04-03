import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatTabsModule } from '@angular/material/tabs';
import { MatChipsModule } from '@angular/material/chips';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatDividerModule } from '@angular/material/divider';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { TunnelService, Tunnel } from '../../services/tunnel';
import { VisiteService, Visite } from '../../services/visite';
import { RapportService, Rapport } from '../../services/rapport';
import { ToastService } from '../../services/toast';
import { VisiteForm } from '../visite-form/visite-form';
import { forkJoin } from 'rxjs';

@Component({
  selector: 'app-tunnel-detail',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatCardModule,
    MatIconModule,
    MatButtonModule,
    MatTabsModule,
    MatChipsModule,
    MatTooltipModule,
    MatDividerModule,
    MatDialogModule
  ],
  templateUrl: './tunnel-detail.html',
  styleUrl: './tunnel-detail.scss'
})
export class TunnelDetail implements OnInit {

  tunnel: Tunnel | null = null;
  visites: Visite[] = [];
  rapports: Rapport[] = [];
  loading: boolean = true;
  activeTab: number = 0;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private tunnelService: TunnelService,
    private visiteService: VisiteService,
    private rapportService: RapportService,
    private toast: ToastService,
    private dialog: MatDialog
  ) {}

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.charger(id);
    }
  }

  charger(tunnelId: string): void {
    this.loading = true;

    forkJoin({
      tunnel: this.tunnelService.getById(tunnelId),
      visites: this.visiteService.getAll(),
      rapports: this.rapportService.getAll()
    }).subscribe({
      next: ({ tunnel, visites, rapports }) => {
        this.tunnel = tunnel;

        // Filtrer les visites de ce tunnel (VisiteDTO a tunnelId en champ plat)
        this.visites = visites
          .filter(v => v.tunnelId === tunnelId)
          .sort((a, b) =>
            new Date(b.datePrevisionnelle).getTime() - new Date(a.datePrevisionnelle).getTime()
          );

        // Filtrer les rapports de ces visites
        const visiteIds = this.visites.map(v => v.id);
        this.rapports = rapports.filter(r => visiteIds.includes(r.visite?.id));

        this.loading = false;
      },
      error: () => {
        this.loading = false;
        this.toast.error('Tunnel introuvable.');
        this.router.navigate(['/tunnels']);
      }
    });
  }

  // --- Helpers ---

  getRapportForVisite(visiteId: string): Rapport | undefined {
    return this.rapports.find(r => r.visite?.id === visiteId);
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
      BROUILLON: 'chip-brouillon', SOUMIS: 'chip-soumis',
      VALIDE: 'chip-valide', A_CORRIGER: 'chip-correction'
    };
    return classes[rapport.statut] || '';
  }

  getVisiteStatutLabel(statut: string): string {
    const labels: Record<string, string> = {
      PLANIFIEE: 'Planifiée', REALISEE: 'Réalisée',
      CLOTUREE: 'Clôturée', ANNULEE: 'Annulée'
    };
    return labels[statut] || statut;
  }

  getVisiteStatutClass(statut: string): string {
    const classes: Record<string, string> = {
      PLANIFIEE: 'chip-planifiee', REALISEE: 'chip-realisee',
      CLOTUREE: 'chip-cloturee', ANNULEE: 'chip-annulee'
    };
    return classes[statut] || '';
  }

  getStatutTunnelClass(statut: string): string {
    const classes: Record<string, string> = {
      ACTIF: 'tunnel-actif', INACTIF: 'tunnel-inactif', EN_TRAVAUX: 'tunnel-travaux'
    };
    return classes[statut] || '';
  }

  getStatutTunnelLabel(statut: string): string {
    const labels: Record<string, string> = {
      ACTIF: 'En service', INACTIF: 'Inactif', EN_TRAVAUX: 'En travaux'
    };
    return labels[statut] || statut;
  }

  get visitesRealisees(): Visite[] {
    return this.visites.filter(v => v.statut === 'REALISEE');
  }

  get visitesPlanifiees(): Visite[] {
    return this.visites.filter(v => v.statut === 'PLANIFIEE');
  }

  // --- Actions ---

  planifierVisite(): void {
    const dialogRef = this.dialog.open(VisiteForm, { width: '560px' });
    dialogRef.afterClosed().subscribe((result: boolean) => {
      if (result && this.tunnel) {
        this.charger(this.tunnel.id);
      }
    });
  }

  ouvrirRapport(rapport: Rapport): void {
    this.router.navigate(['/rapports', rapport.id]);
  }

  retour(): void {
    this.router.navigate(['/tunnels']);
  }
}
