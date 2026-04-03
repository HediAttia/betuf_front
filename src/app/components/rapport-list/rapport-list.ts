import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatTableModule } from '@angular/material/table';
import { MatChipsModule } from '@angular/material/chips';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';
import { MatTooltipModule } from '@angular/material/tooltip';
import { RapportService, Rapport } from '../../services/rapport';
import { Router } from '@angular/router';

@Component({
  selector: 'app-rapport-list',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatTableModule,
    MatChipsModule,
    MatIconModule,
    MatButtonModule,
    MatDialogModule,
    MatTooltipModule
  ],
  templateUrl: './rapport-list.html',
  styleUrl: './rapport-list.scss'
})
export class RapportList implements OnInit {

  rapports: Rapport[] = [];
  colonnes = ['tunnel', 'auteur', 'typeVisite', 'dateSoumission', 'statut', 'version', 'actions'];

  // ID de Dupont pour la démo de validation
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
    });
  }

  valider(rapport: Rapport): void {
    this.rapportService.valider(rapport.id, this.dupont_id).subscribe({
      next: () => this.charger(),
      error: (err) => alert('Validation refusée : ' + err.error)
    });
  }

  corriger(rapport: Rapport): void {
    const commentaire = prompt('Commentaire de correction obligatoire :');
    if (commentaire) {
      this.rapportService.corriger(rapport.id, commentaire).subscribe({
        next: () => this.charger(),
        error: (err) => console.error(err)
      });
    }
  }

  getStatutColor(statut: string): string {
    switch(statut) {
      case 'BROUILLON': return '';
      case 'SOUMIS': return 'primary';
      case 'A_CORRIGER': return 'warn';
      case 'VALIDE': return 'accent';
      default: return '';
    }
  }

  getStatutIcon(statut: string): string {
    switch(statut) {
      case 'BROUILLON': return 'edit';
      case 'SOUMIS': return 'pending';
      case 'A_CORRIGER': return 'warning';
      case 'VALIDE': return 'check_circle';
      default: return 'help';
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
}
