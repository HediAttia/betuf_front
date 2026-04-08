import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatTableModule } from '@angular/material/table';
import { MatChipsModule } from '@angular/material/chips';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatBadgeModule } from '@angular/material/badge';
import { MatDividerModule } from '@angular/material/divider';
import { VisiteService, Visite } from '../../services/visite';
import { RapportService, Rapport } from '../../services/rapport';
import { TunnelService, Tunnel } from '../../services/tunnel';
import { AuthService } from '../../services/auth';
import { forkJoin, of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { NotificationPanel } from '../notification-panel/notification-panel';

interface NonConformite {
  description: string;
  localisation: string;
  criticite: string;
}

@Component({
  selector: 'app-dashboard-ingenieur',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatCardModule,
    MatTableModule,
    MatChipsModule,
    NotificationPanel,
    MatIconModule,
    MatButtonModule,
    MatBadgeModule,
    MatDividerModule
  ],
  templateUrl: './dashboard-ingenieur.html',
  styleUrl: './dashboard-ingenieur.scss'
})
export class DashboardIngenieur implements OnInit {

  mesVisites: Visite[] = [];
  mesRapports: Rapport[] = [];
  rapportsACorrection: Rapport[] = [];
  rapportsBrouillon: number = 0;
  rapportsValides: number = 0;
  userId: string = '';
  nomComplet: string = '';
  tunnels: Tunnel[] = [];

  // Historique NC par tunnel
  visiteHistorique: Visite | null = null;
  historiquesNC: { rapport: Rapport; ncs: NonConformite[] }[] = [];
  chargementHistorique: boolean = false;
  // Tous les rapports validés (pour l'historique NC des tunnels)
  tousRapportsValides: Rapport[] = [];

  colonnesVisites = ['tunnel', 'typeVisite', 'datePrevisionnelle', 'statut', 'actions'];
  colonnesRapports = ['tunnel', 'statut', 'version', 'dateSoumission', 'actions'];

  constructor(
    private visiteService: VisiteService,
    private rapportService: RapportService,
    private tunnelService: TunnelService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.userId = this.authService.getUserId() || '';
    this.nomComplet = this.authService.getNomComplet();
    this.charger();
  }

  charger(): void {
    forkJoin({
      tunnels: this.tunnelService.getActifs().pipe(catchError(() => of([]))),
      visites: this.visiteService.getVisitesByIntervenant(this.userId).pipe(catchError(() => of([]))),
      rapports: this.rapportService.getByAuteur(this.userId).pipe(catchError(() => of([]))),
      tousValides: this.rapportService.getByStatut('VALIDE').pipe(catchError(() => of([])))
    }).subscribe(({ tunnels, visites, rapports, tousValides }) => {
      this.tunnels = tunnels;
      this.mesVisites = visites;
      this.mesRapports = rapports;
      this.rapportsACorrection = rapports.filter((r: Rapport) => r.statut === 'A_CORRIGER');
      this.rapportsBrouillon = rapports.filter((r: Rapport) => r.statut === 'BROUILLON').length;
      this.rapportsValides = rapports.filter((r: Rapport) => r.statut === 'VALIDE').length;
      this.tousRapportsValides = tousValides;
    });
  }

  // Résolution du nom de tunnel (comme dans dashboard.ts)
  // L'API peut renvoyer tunnel = objet complet, partiel ou juste un ID
  private resoudreTunnel(tunnelField: any): Tunnel | null {
    if (tunnelField?.nom) return tunnelField;
    const id = tunnelField?.id ?? tunnelField ?? null;
    if (id && typeof id === 'string') return this.tunnels.find(t => t.id === id) ?? null;
    return null;
  }

  getTunnelNomVisite(v: Visite): string {
    const t = this.resoudreTunnel(v.tunnel ?? (v as any).tunnelId);
    return t?.nom || (v as any).tunnelNom || '—';
  }

  getTunnelLocVisite(v: Visite): string {
    const t = this.resoudreTunnel(v.tunnel ?? (v as any).tunnelId);
    return t?.localisation || '';
  }

  getTunnelNomRapport(r: Rapport): string {
    // Essai 1 : tunnel imbriqué dans visite
    const t = this.resoudreTunnel(r.visite?.tunnel ?? (r.visite as any)?.tunnelId);
    if (t?.nom) return t.nom;
    // Essai 2 : champs plats sur visite
    return (r.visite as any)?.tunnelNom || '—';
  }

  // ── Historique NC du tunnel ──────────────────────────────────────────
  voirHistoriqueNC(visite: Visite): void {
    if (this.visiteHistorique?.id === visite.id) {
      this.visiteHistorique = null;
      this.historiquesNC = [];
      return;
    }

    this.visiteHistorique = visite;
    this.chargementHistorique = true;

    // Résoudre le tunnelId depuis tous les champs possibles
    const tunnel = this.resoudreTunnel(visite.tunnel ?? (visite as any).tunnelId);
    const tunnelId = tunnel?.id ?? visite.tunnel?.id ?? (visite as any).tunnelId ?? null;
    const tunnelNom = tunnel?.nom ?? visite.tunnel?.nom ?? (visite as any).tunnelNom ?? null;

    // Filtrer les rapports validés pour ce tunnel (multicouche)
    const rapportsTunnel = this.tousRapportsValides.filter((r: Rapport) => {
      const v = r.visite as any;
      if (tunnelId) {
        if (v?.tunnel?.id === tunnelId) return true;
        if (v?.tunnelId === tunnelId) return true;
      }
      if (tunnelNom && v?.tunnel?.nom === tunnelNom) return true;
      if (tunnelNom && v?.tunnelNom === tunnelNom) return true;
      return false;
    });

    this.historiquesNC = rapportsTunnel
      .map((r: Rapport) => {
        let ncs: NonConformite[] = [];
        if (r.nonConformites) {
          try { ncs = JSON.parse(r.nonConformites); } catch { ncs = []; }
        }
        return { rapport: r, ncs };
      })
      .filter(item => item.ncs.length > 0);

    this.chargementHistorique = false;
  }

  fermerHistorique(): void {
    this.visiteHistorique = null;
    this.historiquesNC = [];
  }

  getCriticiteClass(criticite: string): string {
    switch (criticite) {
      case 'CRITIQUE': return 'nc-critique';
      case 'ELEVEE':   return 'nc-elevee';
      case 'MODEREE':  return 'nc-moderee';
      case 'FAIBLE':   return 'nc-faible';
      default: return '';
    }
  }

  // ── Statuts ──────────────────────────────────────────────────────────
  getStatutVisiteColor(statut: string): string {
    switch(statut) {
      case 'PLANIFIEE': return 'primary';
      case 'REALISEE': return 'accent';
      case 'ANNULEE': return 'warn';
      default: return '';
    }
  }

  getStatutRapportColor(statut: string): string {
    switch(statut) {
      case 'BROUILLON': return '';
      case 'SOUMIS': return 'primary';
      case 'A_CORRIGER': return 'warn';
      case 'VALIDE': return 'accent';
      default: return '';
    }
  }

  marquerRealisee(visiteId: string): void {
    const today = new Date().toISOString().split('T')[0];
    this.visiteService.marquerRealisee(visiteId, today).subscribe({
      next: () => this.charger(),
      error: (err) => console.error('Erreur:', err)
    });
  }
}
