import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { RapportService, Rapport } from '../../services/rapport';
import { AuthService } from '../../services/auth';
import { Router } from '@angular/router';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { CorrectionDialog } from '../correction-dialog/correction-dialog';

@Component({
  selector: 'app-rapport-list',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterModule,
    MatDialogModule
  ],
  templateUrl: './rapport-list.html',
  styleUrl: './rapport-list.scss'
})
export class RapportList implements OnInit {

  rapports: Rapport[] = [];
  rapportsFiltres: Rapport[] = [];
  recherche: string = '';
  filtreStatut: string = '';
  rapportSelectionne: Rapport | null = null;

  constructor(
    private rapportService: RapportService,
    private authService: AuthService,
    private router: Router,
    private dialog: MatDialog
  ) {}

  get role(): string {
    return this.authService.getRole() || '';
  }

  get userId(): string {
    return this.authService.getUserId() || '';
  }

  ngOnInit(): void {
    this.charger();
  }

  charger(): void {
    // RG-DIFF-01 : l'exploitant ne voit que les rapports VALIDÉS
    // L'ingénieur ne voit que ses propres rapports
    let obs;
    if (this.role === 'INGENIEUR') {
      obs = this.rapportService.getByAuteur(this.userId);
    } else if (this.role === 'EXPLOITANT') {
      obs = this.rapportService.getByStatut('VALIDE');
    } else {
      obs = this.rapportService.getAll();
    }

    obs.subscribe((data: Rapport[]) => {
      this.rapports = data;
      this.appliquerFiltres();
    });
  }

  filtrer(): void {
    this.appliquerFiltres();
  }

  filtrerStatut(statut: string): void {
    this.filtreStatut = statut;
    this.appliquerFiltres();
  }

  private appliquerFiltres(): void {
    let res = this.rapports;
    if (this.recherche.trim()) {
      const q = this.recherche.toLowerCase();
      res = res.filter(r =>
        r.visite?.tunnel?.nom?.toLowerCase().includes(q) ||
        r.auteur?.nom?.toLowerCase().includes(q) ||
        r.auteur?.prenom?.toLowerCase().includes(q)
      );
    }
    if (this.filtreStatut) {
      res = res.filter(r => r.statut === this.filtreStatut);
    }
    this.rapportsFiltres = res;
  }

  selectionner(r: Rapport): void {
    this.rapportSelectionne = this.rapportSelectionne?.id === r.id ? null : r;
  }

  valider(rapport: Rapport): void {
    this.rapportService.valider(rapport.id, this.userId).subscribe({
      next: () => {
        this.charger();
        this.rapportSelectionne = null;
      },
      error: () => {}
    });
  }

  corriger(rapport: Rapport): void {
    const ref = this.dialog.open(CorrectionDialog, { width: '520px', panelClass: 'custom-dialog' });
    ref.afterClosed().subscribe((commentaire: string | null) => {
      if (commentaire) {
        this.rapportService.corriger(rapport.id, commentaire).subscribe({
          next: () => {
            this.charger();
            this.rapportSelectionne = null;
          },
          error: (err) => console.error(err)
        });
      }
    });
  }

  peutValider(rapport: Rapport): boolean {
    return rapport.statut === 'SOUMIS' && this.role === 'CHARGE_MISSION';
  }

  peutCorrection(rapport: Rapport): boolean {
    return rapport.statut === 'SOUMIS' && this.role === 'CHARGE_MISSION';
  }

  peutModifier(rapport: Rapport): boolean {
    return this.role === 'INGENIEUR' &&
      (rapport.statut === 'BROUILLON' || rapport.statut === 'A_CORRIGER');
  }

  ouvrirDetail(rapport: Rapport): void {
    if (this.peutModifier(rapport)) {
      this.router.navigate(['/rapports', rapport.id, 'modifier']);
    } else {
      this.router.navigate(['/rapports', rapport.id]);
    }
  }

  getStatutClass(statut: string): string {
    switch (statut) {
      case 'BROUILLON':  return 'statut-brouillon';
      case 'SOUMIS':     return 'statut-soumis';
      case 'A_CORRIGER': return 'statut-corriger';
      case 'VALIDE':     return 'statut-valide';
      default: return '';
    }
  }

  getStatutLabel(statut: string): string {
    switch (statut) {
      case 'BROUILLON':  return 'Brouillon';
      case 'SOUMIS':     return 'Soumis';
      case 'A_CORRIGER': return 'À corriger';
      case 'VALIDE':     return 'Validé';
      default: return statut;
    }
  }

  getTypeVisiteClass(type: string): string {
    switch (type) {
      case 'PERIODIQUE':   return 'tv-periodique';
      case 'INOPINEE':     return 'tv-inopinee';
      case 'EXCEPTIONNELLE': return 'tv-exceptionnelle';
      default: return 'tv-default';
    }
  }

  countStatut(statut: string): number {
    return this.rapports.filter(r => r.statut === statut).length;
  }

  getTunnelNom(r: Rapport): string {
    return r.visite?.tunnel?.nom || r.visite?.tunnelNom || 'Tunnel non renseigné';
  }

  getInitiales(auteur: any): string {
    if (!auteur) return '?';
    const p = auteur.prenom?.[0] || '';
    const n = auteur.nom?.[0] || '';
    return (p + n).toUpperCase() || '?';
  }

  getRoleLabel(role: string): string {
    switch (role) {
      case 'INGENIEUR':      return 'Ingénieur terrain';
      case 'CHARGE_MISSION': return 'Chargé de mission';
      case 'EXPLOITANT':     return 'Exploitant';
      default: return role || '';
    }
  }
}
