import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatChipsModule } from '@angular/material/chips';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatDividerModule } from '@angular/material/divider';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { RapportService, Rapport } from '../../services/rapport';
import { TunnelService, Tunnel } from '../../services/tunnel';
import { AuthService } from '../../services/auth';
import { CorrectionDialog } from '../correction-dialog/correction-dialog';
import { HistoriquePanel } from '../historique-panel/historique-panel';

@Component({
  selector: 'app-rapport-detail',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatCardModule,
    MatChipsModule,
    MatIconModule,
    MatButtonModule,
    MatDividerModule,
    MatTooltipModule,
    MatSnackBarModule,
    MatDialogModule,
    HistoriquePanel
  ],
  templateUrl: './rapport-detail.html',
  styleUrl: './rapport-detail.scss'
})
export class RapportDetail implements OnInit {

  rapport: Rapport | null = null;
  nonConformites: any[] = [];
  tunnelResolu: Tunnel | null = null;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private rapportService: RapportService,
    private tunnelService: TunnelService,
    private authService: AuthService,
    private snackBar: MatSnackBar,
    private dialog: MatDialog
  ) {}

  get role(): string {
    return this.authService.getRole() || '';
  }

  get estIngenieur(): boolean {
    return this.role === 'INGENIEUR';
  }

  get estExploitant(): boolean {
    return this.role === 'EXPLOITANT';
  }

  get estChargeMission(): boolean {
    return this.role === 'CHARGE_MISSION';
  }

  peutModifier(): boolean {
    return this.estIngenieur &&
      !!this.rapport &&
      (this.rapport.statut === 'BROUILLON' || this.rapport.statut === 'A_CORRIGER');
  }

  modifierRapport(): void {
    if (this.rapport) {
      this.router.navigate(['/rapports', this.rapport.id, 'modifier']);
    }
  }

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.charger(id);
    }
  }

  charger(id: string): void {
    this.rapportService.getById(id).subscribe((data: Rapport) => {
      // RG-DIFF-01 : l'exploitant ne peut accéder qu'aux rapports VALIDÉS
      if (this.estExploitant && data.statut !== 'VALIDE') {
        this.router.navigate(['/rapports']);
        return;
      }
      this.rapport = data;
      if (data.nonConformites) {
        try {
          this.nonConformites = JSON.parse(data.nonConformites);
        } catch {
          this.nonConformites = [];
        }
      }
      // Résoudre le tunnel si l'objet visite ne l'embeds pas complètement
      const tunnelField = data.visite?.tunnel ?? (data.visite as any)?.tunnelId;
      if (tunnelField?.nom) {
        this.tunnelResolu = tunnelField;
      } else {
        const tunnelId = tunnelField?.id ?? tunnelField ?? null;
        if (tunnelId && typeof tunnelId === 'string') {
          this.tunnelService.getById(tunnelId).subscribe(t => this.tunnelResolu = t);
        }
      }
    });
  }

  getTunnelNom(): string {
    return this.tunnelResolu?.nom || this.rapport?.visite?.tunnel?.nom || (this.rapport?.visite as any)?.tunnelNom || '—';
  }

  getTunnelLoc(): string {
    return this.tunnelResolu?.localisation || this.rapport?.visite?.tunnel?.localisation || (this.rapport?.visite as any)?.tunnelLocalisation || '—';
  }

  valider(): void {
    if (!this.rapport) return;
    const userId = this.authService.getUserId() || '';
    this.rapportService.valider(this.rapport.id, userId).subscribe({
      next: () => {
        this.snackBar.open('Rapport validé avec succès !', 'Fermer', { duration: 3000, panelClass: 'snack-success' });
        this.charger(this.rapport!.id);
      },
      error: () => {
        this.snackBar.open('Validation refusée — RG-VAL-03', 'Fermer', { duration: 4000, panelClass: 'snack-error' });
      }
    });
  }

  corriger(): void {
    if (!this.rapport) return;
    const ref = this.dialog.open(CorrectionDialog, { width: '520px', panelClass: 'custom-dialog' });
    ref.afterClosed().subscribe((commentaire: string | null) => {
      if (commentaire) {
        this.rapportService.corriger(this.rapport!.id, commentaire).subscribe({
          next: () => {
            this.snackBar.open('Rapport retourné pour correction.', 'Fermer', { duration: 3000 });
            this.charger(this.rapport!.id);
          },
          error: (err) => console.error(err)
        });
      }
    });
  }

  retour(): void {
    this.router.navigate(['/rapports']);
  }

  exportPDF(): void {
    window.print();
  }

  getStatutColor(statut: string): string {
    switch(statut) {
      case 'SOUMIS': return 'primary';
      case 'A_CORRIGER': return 'warn';
      case 'VALIDE': return 'accent';
      default: return '';
    }
  }

  getCriticiteColor(criticite: string): string {
    switch(criticite) {
      case 'CRITIQUE': return 'warn';
      case 'MODEREE': return 'accent';
      case 'FAIBLE': return 'primary';
      default: return '';
    }
  }
}
