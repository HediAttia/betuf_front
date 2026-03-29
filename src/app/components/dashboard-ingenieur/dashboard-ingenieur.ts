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
import { AuthService } from '../../services/auth';

@Component({
  selector: 'app-dashboard-ingenieur',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatCardModule,
    MatTableModule,
    MatChipsModule,
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

  colonnesVisites = ['tunnel', 'typeVisite', 'datePrevisionnelle', 'statut', 'actions'];
  colonnesRapports = ['tunnel', 'statut', 'version', 'dateSoumission', 'actions'];

  constructor(
    private visiteService: VisiteService,
    private rapportService: RapportService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.userId = this.authService.getUserId() || '';
    this.nomComplet = this.authService.getNomComplet();
    this.charger();
  }

  charger(): void {
    this.visiteService.getVisitesByIntervenant(this.userId).subscribe((data: Visite[]) => {
      this.mesVisites = data;
    });

    this.rapportService.getByAuteur(this.userId).subscribe((data: Rapport[]) => {
      this.mesRapports = data;
      this.rapportsACorrection = data.filter((r: Rapport) => r.statut === 'A_CORRIGER');
      this.rapportsBrouillon = data.filter((r: Rapport) => r.statut === 'BROUILLON').length;
      this.rapportsValides = data.filter((r: Rapport) => r.statut === 'VALIDE').length;
    });
  }

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
