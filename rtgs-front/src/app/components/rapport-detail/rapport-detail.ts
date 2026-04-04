import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatChipsModule } from '@angular/material/chips';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatDividerModule } from '@angular/material/divider';
import { MatTooltipModule } from '@angular/material/tooltip';
import { RapportService, Rapport } from '../../services/rapport';
import { AuthService } from '../../services/auth';
import { ToastService } from '../../services/toast';
import Swal from 'sweetalert2';
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
    HistoriquePanel
  ],
  templateUrl: './rapport-detail.html',
  styleUrl: './rapport-detail.scss'
})
export class RapportDetail implements OnInit {

  rapport: Rapport | null = null;
  nonConformites: any[] = [];
  validateurId: string = '';
  userRole: string = '';

  workflowSteps = [
    { label: 'Visite planifiée', done: false, active: false },
    { label: 'Visite réalisée', done: false, active: false },
    { label: 'Saisie rapport', done: false, active: false },
    { label: 'Soumis en validation', done: false, active: false },
    { label: 'Validé', done: false, active: false }
  ];

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private rapportService: RapportService,
    private authService: AuthService,
    private toast: ToastService
  ) {}

  ngOnInit(): void {
    this.validateurId = this.authService.getUserId() || '';
    this.userRole = this.authService.getRole() || '';
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.charger(id);
    }
  }

  charger(id: string): void {
    this.rapportService.getById(id).subscribe({
      next: (data: Rapport) => {
        this.rapport = data;
        if (data.nonConformites) {
          try {
            this.nonConformites = JSON.parse(data.nonConformites);
          } catch {
            this.nonConformites = [];
          }
        }
        this.updateWorkflow(data.statut);
      },
      error: () => {
        this.toast.error('Rapport introuvable.');
        this.router.navigate(['/rapports']);
      }
    });
  }

  private updateWorkflow(statut: string): void {
    this.workflowSteps.forEach(s => { s.done = false; s.active = false; });
    // Étapes 1-2 toujours done (le rapport existe donc la visite a été planifiée et réalisée)
    this.workflowSteps[0].done = true;
    this.workflowSteps[1].done = true;

    switch (statut) {
      case 'BROUILLON':
      case 'A_CORRIGER':
        this.workflowSteps[2].active = true;
        break;
      case 'SOUMIS':
        this.workflowSteps[2].done = true;
        this.workflowSteps[3].active = true;
        break;
      case 'VALIDE':
        this.workflowSteps[2].done = true;
        this.workflowSteps[3].done = true;
        this.workflowSteps[4].done = true;
        break;
    }
  }

  get isChargeMission(): boolean {
    return this.userRole === 'CHARGE_MISSION';
  }

  get isAuteurAndEditable(): boolean {
    if (!this.rapport) return false;
    const isAuteur = this.rapport.auteur?.id === this.validateurId;
    const isEditable = this.rapport.statut === 'BROUILLON' || this.rapport.statut === 'A_CORRIGER';
    return isAuteur && isEditable;
  }

  modifierRapport(): void {
    if (this.rapport) {
      this.router.navigate(['/rapports', this.rapport.id, 'edit']);
    }
  }

  valider(): void {
    if (!this.rapport) return;
    this.rapportService.valider(this.rapport.id, this.validateurId).subscribe({
      next: () => {
        this.toast.success('Rapport validé avec succès !');
        this.charger(this.rapport!.id);
      },
      error: () => {
        this.toast.error('Validation refusée — vous ne pouvez pas valider votre propre rapport (RG-VAL-03).');
      }
    });
  }

  async retournerPourCorrection(): Promise<void> {
    if (!this.rapport) return;

    const { value: commentaire } = await Swal.fire({
      title: 'Retourner pour correction',
      input: 'textarea',
      inputLabel: 'Commentaire de correction (20 caractères minimum)',
      inputPlaceholder: 'Précisez les éléments à corriger ou compléter...',
      inputAttributes: { 'aria-label': 'Commentaire de correction' },
      showCancelButton: true,
      confirmButtonText: 'Retourner',
      cancelButtonText: 'Annuler',
      confirmButtonColor: '#c0392b',
      inputValidator: (value) => {
        if (!value) return 'Le commentaire est obligatoire.';
        if (value.length < 20) return `Trop court (${value.length}/20 min).`;
        return null;
      }
    });

    if (commentaire) {
      this.rapportService.retourner(this.rapport.id, commentaire).subscribe({
        next: () => {
          this.toast.warning('Rapport retourné pour correction.');
          this.charger(this.rapport!.id);
        },
        error: (err: any) => {
          console.error('Erreur:', err);
          this.toast.error('Erreur lors du retour pour correction.');
        }
      });
    }
  }

  retour(): void {
    this.router.navigate(['/rapports']);
  }

  getStatutColor(statut: string): string {
    switch (statut) {
      case 'SOUMIS': return 'primary';
      case 'A_CORRIGER': return 'warn';
      case 'VALIDE': return 'accent';
      default: return '';
    }
  }

  getCriticiteColor(criticite: string): string {
    switch (criticite) {
      case 'CRITIQUE': return 'warn';
      case 'MODEREE': return 'accent';
      case 'FAIBLE': return 'primary';
      default: return '';
    }
  }
}
