import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { RapportService, Rapport } from '../../services/rapport';
import { Router } from '@angular/router';

@Component({
  selector: 'app-rapport-list',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterModule
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

  dupont_id = 'b1000000-0000-0000-0000-000000000001';

  constructor(
    private rapportService: RapportService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.charger();
  }

  charger(): void {
    this.rapportService.getAll().subscribe((data: Rapport[]) => {
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
    this.rapportService.valider(rapport.id, this.dupont_id).subscribe({
      next: () => {
        this.charger();
        this.rapportSelectionne = null;
      },
      error: (err) => alert('Validation refusée : ' + err.error)
    });
  }

  corriger(rapport: Rapport): void {
    const commentaire = prompt('Commentaire de correction obligatoire :');
    if (commentaire) {
      this.rapportService.corriger(rapport.id, commentaire).subscribe({
        next: () => {
          this.charger();
          this.rapportSelectionne = null;
        },
        error: (err) => console.error(err)
      });
    }
  }

  peutValider(rapport: Rapport): boolean {
    return rapport.statut === 'SOUMIS';
  }

  peutCorrection(rapport: Rapport): boolean {
    return rapport.statut === 'SOUMIS';
  }

  ouvrirDetail(rapport: Rapport): void {
    this.router.navigate(['/rapports', rapport.id]);
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
