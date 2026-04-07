import { Component, OnInit, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatTooltipModule } from '@angular/material/tooltip';
import { HistoriqueService, HistoriqueStatut } from '../../services/historique';

@Component({
  selector: 'app-historique-panel',
  standalone: true,
  imports: [
    CommonModule,
    MatIconModule,
    MatCardModule,
    MatTooltipModule
  ],
  templateUrl: './historique-panel.html',
  styleUrl: './historique-panel.scss'
})
export class HistoriquePanel implements OnInit {

  @Input() entiteType: string = 'RAPPORT';
  @Input() entiteId: string = '';

  historique: HistoriqueStatut[] = [];
  loading: boolean = true;

  constructor(private historiqueService: HistoriqueService) {}

  ngOnInit(): void {
    if (this.entiteId) {
      this.charger();
    }
  }

  charger(): void {
    this.loading = true;
    const source$ = this.entiteType === 'VISITE'
      ? this.historiqueService.getHistoriqueVisite(this.entiteId)
      : this.historiqueService.getHistoriqueRapport(this.entiteId);

    source$.subscribe({
      next: (data) => { this.historique = data; this.loading = false; },
      error: () => { this.historique = []; this.loading = false; }
    });
  }

  getStatutIcon(statut: string): string {
    const icons: Record<string, string> = {
      'PLANIFIEE': 'event', 'REALISEE': 'check', 'CLOTUREE': 'lock', 'ANNULEE': 'cancel',
      'BROUILLON': 'edit_note', 'SOUMIS': 'send', 'A_CORRIGER': 'replay', 'VALIDE': 'verified', 'ANNULE': 'delete'
    };
    return icons[statut] || 'swap_horiz';
  }

  getStatutClass(statut: string): string {
    const classes: Record<string, string> = {
      'PLANIFIEE': 'step-planifiee', 'REALISEE': 'step-realisee', 'CLOTUREE': 'step-cloturee',
      'ANNULEE': 'step-annulee', 'BROUILLON': 'step-brouillon', 'SOUMIS': 'step-soumis',
      'A_CORRIGER': 'step-correction', 'VALIDE': 'step-valide', 'ANNULE': 'step-annulee'
    };
    return classes[statut] || '';
  }

  getStatutLabel(statut: string): string {
    const labels: Record<string, string> = {
      'PLANIFIEE': 'Planifiée', 'REALISEE': 'Réalisée', 'CLOTUREE': 'Clôturée', 'ANNULEE': 'Annulée',
      'BROUILLON': 'Brouillon', 'SOUMIS': 'Soumis', 'A_CORRIGER': 'À corriger', 'VALIDE': 'Validé', 'ANNULE': 'Annulé'
    };
    return labels[statut] || statut;
  }

  formatDate(dateStr: string): string {
    if (!dateStr) return '';
    return new Date(dateStr).toLocaleDateString('fr-FR', {
      day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit'
    });
  }

  getRoleLabel(role: string): string {
    const labels: Record<string, string> = {
      'CHARGE_MISSION': 'Chargé de mission', 'INGENIEUR': 'Ingénieur BETuF',
      'EXPLOITANT': 'Exploitant', 'ADMIN': 'Administrateur'
    };
    return labels[role] || role;
  }
}
