import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatDividerModule } from '@angular/material/divider';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { VisiteService, Visite } from '../../services/visite';
import { RapportService, Rapport } from '../../services/rapport';
import { AuthService } from '../../services/auth';
import { ToastService } from '../../services/toast';

interface NonConformite {
  description: string;
  localisation: string;
  criticite: string;
}

@Component({
  selector: 'app-rapport-form',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatIconModule,
    MatChipsModule,
    MatTooltipModule,
    MatDividerModule,
    MatProgressBarModule
  ],
  templateUrl: './rapport-form.html',
  styleUrl: './rapport-form.scss'
})
export class RapportForm implements OnInit {

  // --- Données formulaire ---
  visites: Visite[] = [];
  visiteSelectionnee: string = '';
  constats: string = '';
  recommandations: string = '';
  nonConformites: NonConformite[] = [];
  loading: boolean = false;
  userId: string = '';
  userName: string = '';

  // --- Mode édition brouillon ---
  rapportId: string | null = null;
  rapportExistant: Rapport | null = null;
  isEditMode: boolean = false;

  niveauxCriticite = ['FAIBLE', 'MODEREE', 'ELEVEE', 'CRITIQUE'];

  // --- Workflow steps (stepper horizontal) ---
  workflowSteps = [
    { label: 'Visite planifiée', done: true, active: false },
    { label: 'Visite réalisée', done: true, active: false },
    { label: 'Saisie rapport', done: false, active: true },
    { label: 'Soumis en validation', done: false, active: false },
    { label: 'Validé', done: false, active: false }
  ];

  constructor(
    private visiteService: VisiteService,
    private rapportService: RapportService,
    private authService: AuthService,
    private router: Router,
    private route: ActivatedRoute,
    private toast: ToastService
  ) {}

  ngOnInit(): void {
    this.userId = this.authService.getUserId() || '';
    // Si getUserName n'existe pas sur ton AuthService, adapte cette ligne
    this.userName = (this.authService as any).getUserName?.() || 'Ingénieur';

    // Charger uniquement les visites assignées à cet ingénieur
    this.visiteService.getVisitesRealiseesByIntervenant(this.userId).subscribe({
      next: (data: Visite[]) => {
        this.visites = data;
        // Auto-sélectionner la visite si passée en query param (depuis le dashboard)
        const visiteIdParam = this.route.snapshot.queryParamMap.get('visiteId');
        if (visiteIdParam && !this.visiteSelectionnee) {
          this.visiteSelectionnee = visiteIdParam;
        }
      },
      error: () => {
        this.toast.error('Impossible de charger les visites.');
      }
    });

    // Mode édition : si un ID est passé dans la route (/rapports/:id/edit)
    this.rapportId = this.route.snapshot.paramMap.get('id');
    if (this.rapportId) {
      this.chargerRapport(this.rapportId);
    }
  }

  // =============================================
  //  Chargement rapport existant (brouillon / rejeté)
  // =============================================

  chargerRapport(id: string): void {
    this.rapportService.getById(id).subscribe({
      next: (rapport: Rapport) => {
        this.rapportExistant = rapport;
        this.isEditMode = true;
        this.visiteSelectionnee = rapport.visite?.id || '';
        this.constats = rapport.constats || '';
        this.recommandations = rapport.recommandations || '';
        try {
          this.nonConformites = rapport.nonConformites
            ? JSON.parse(rapport.nonConformites)
            : [];
        } catch {
          this.nonConformites = [];
        }
        this.updateWorkflow(rapport.statut);
      },
      error: () => {
        this.toast.error('Rapport introuvable.');
        this.router.navigate(['/rapports']);
      }
    });
  }

  private updateWorkflow(statut: string): void {
    this.workflowSteps.forEach(s => { s.done = false; s.active = false; });
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

  // =============================================
  //  Getters
  // =============================================

  get visiteDetail(): Visite | undefined {
    return this.visites.find(v => v.id === this.visiteSelectionnee);
  }

  get rapportReference(): string {
    const v = this.rapportExistant?.visite || this.visiteDetail;
    if (!v) return 'Nouveau rapport';
    const date = v.dateRealisation
      ? new Date(v.dateRealisation).toLocaleDateString('fr-FR')
      : '';
    return `Rapport – ${v.typeVisite || 'Visite'} du ${date}`;
  }

  get rapportSousTitre(): string {
    const tunnel = this.rapportExistant?.visite?.tunnel?.nom
      || this.visiteDetail?.tunnel?.nom || '';
    return tunnel ? `${tunnel} · Auteur : ${this.userName}` : '';
  }

  get currentStatut(): string {
    return this.rapportExistant?.statut || 'BROUILLON';
  }

  get isEditable(): boolean {
    return this.currentStatut === 'BROUILLON' || this.currentStatut === 'A_CORRIGER';
  }

  // =============================================
  //  Complétude
  // =============================================

  get completudeItems(): { label: string; status: string }[] {
    return [
      {
        label: 'Informations de visite',
        status: this.visiteSelectionnee ? 'Complet' : 'À renseigner'
      },
      {
        label: 'Synthèse générale',
        status: this.constats.length >= 50
          ? 'Renseigné'
          : this.constats.length > 0 ? 'Incomplet' : 'À renseigner'
      },
      {
        label: 'Recommandations',
        status: this.recommandations.length >= 10
          ? 'Renseigné'
          : this.recommandations.length > 0 ? 'Incomplet' : 'À renseigner'
      },
      {
        label: 'Non-conformités',
        status: this.nonConformites.length > 0
          ? (this.ncToutesValides ? `${this.nonConformites.length} NC` : 'Incomplet')
          : 'Optionnel'
      }
    ];
  }

  get ncToutesValides(): boolean {
    return this.nonConformites.every(nc => nc.description && nc.localisation && nc.criticite);
  }

  get peutSoumettre(): boolean {
    return !!this.visiteSelectionnee
      && this.constats.length >= 50
      && this.recommandations.length >= 10
      && (this.nonConformites.length === 0 || this.ncToutesValides)
      && !this.loading;
  }

  getCompletionStatusClass(status: string): string {
    if (status === 'Complet' || status === 'Renseigné' || status.includes('NC')) return 'status-ok';
    if (status === 'Incomplet' || status === 'À renseigner') return 'status-pending';
    return 'status-optional';
  }

  // =============================================
  //  Timeline sidebar
  // =============================================

  get timelineEvents(): { date: string; label: string; status: 'done' | 'current' | 'pending' }[] {
    const v = this.visiteDetail || this.rapportExistant?.visite;
    const events: { date: string; label: string; status: 'done' | 'current' | 'pending' }[] = [];

    if (v?.dateRealisation) {
      events.push({
        date: new Date(v.dateRealisation).toLocaleDateString('fr-FR'),
        label: 'Visite réalisée sur site',
        status: 'done'
      });
    }

    events.push({
      date: this.rapportExistant?.createdAt
        ? new Date(this.rapportExistant.createdAt).toLocaleDateString('fr-FR')
        : "Aujourd'hui",
      label: `Rapport créé (statut : ${this.getStatutLabel(this.currentStatut)})`,
      status: 'current'
    });

    events.push({
      date: this.rapportExistant?.dateSoumission
        ? new Date(this.rapportExistant.dateSoumission).toLocaleDateString('fr-FR')
        : 'En attente',
      label: 'Soumission pour validation',
      status: ['SOUMIS', 'VALIDE'].includes(this.currentStatut) ? 'done' : 'pending'
    });

    events.push({
      date: this.rapportExistant?.dateValidation
        ? new Date(this.rapportExistant.dateValidation).toLocaleDateString('fr-FR')
        : '—',
      label: 'Validation par responsable',
      status: this.currentStatut === 'VALIDE' ? 'done' : 'pending'
    });

    return events;
  }

  getStatutLabel(statut: string): string {
    const labels: Record<string, string> = {
      BROUILLON: 'Brouillon', SOUMIS: 'Soumis', VALIDE: 'Validé', A_CORRIGER: 'À corriger'
    };
    return labels[statut] || statut;
  }

  // =============================================
  //  Non-conformités
  // =============================================

  ajouterNC(): void {
    this.nonConformites.push({ description: '', localisation: '', criticite: 'MODEREE' });
  }

  supprimerNC(index: number): void {
    this.nonConformites.splice(index, 1);
  }

  getCriticiteLabel(criticite: string): string {
    const labels: Record<string, string> = {
      FAIBLE: 'Sévérité faible', MODEREE: 'Sévérité modérée',
      ELEVEE: 'Sévérité haute', CRITIQUE: 'Sévérité critique'
    };
    return labels[criticite] || criticite;
  }

  getCriticiteClass(criticite: string): string {
    const classes: Record<string, string> = {
      FAIBLE: 'sev-faible', MODEREE: 'sev-moderee',
      ELEVEE: 'sev-elevee', CRITIQUE: 'sev-critique'
    };
    return classes[criticite] || '';
  }

  // =============================================
  //  ACTIONS : Enregistrer / Soumettre
  // =============================================

  enregistrer(): void {
    if (!this.visiteSelectionnee) {
      this.toast.warning('Veuillez sélectionner une visite.');
      return;
    }
    this.sauvegarder(false);
  }

  async soumettre(): Promise<void> {
    if (!this.peutSoumettre) {
      this.toast.error('Veuillez compléter tous les champs obligatoires.');
      return;
    }

    const confirmed = await this.toast.confirm(
      'Soumettre le rapport ?',
      'Le rapport sera envoyé au chargé de mission pour validation. Vous ne pourrez plus le modifier.'
    );
    if (!confirmed) return;

    this.sauvegarder(true);
  }

  private sauvegarder(soumettre: boolean): void {
    this.loading = true;

    const body = {
      constats: this.constats,
      recommandations: this.recommandations,
      nonConformites: JSON.stringify(this.nonConformites)
    };

    // ---- MODE ÉDITION : mise à jour du brouillon existant ----
    if (this.isEditMode && this.rapportExistant) {
      this.rapportService.modifier(this.rapportExistant.id, body).subscribe({
        next: (rapport) => {
          if (soumettre) {
            this.soumettreRapport(rapport.id);
          } else {
            this.loading = false;
            this.toast.success('Brouillon mis à jour.');
            this.router.navigate(['/rapports']);
          }
        },
        error: (err) => {
          this.loading = false;
          console.error('Erreur mise à jour:', err);
          this.toast.error('Erreur lors de la mise à jour du rapport.');
        }
      });
      return;
    }

    // ---- MODE CRÉATION : nouveau rapport ----
    this.rapportService.creer(this.visiteSelectionnee, this.userId, body).subscribe({
      next: (rapport) => {
        if (soumettre) {
          this.soumettreRapport(rapport.id);
        } else {
          this.loading = false;
          this.toast.success('Brouillon enregistré.');
          this.router.navigate(['/rapports']);
        }
      },
      error: (err: any) => {
        this.loading = false;
        console.error('Erreur création:', err);

        // 409 Conflict = un rapport existe déjà pour cette visite
        if (err.status === 409) {
          this.toast.warning('Un rapport existe déjà pour cette visite. Redirection vers le brouillon...');
          // Chercher le rapport existant pour cette visite dans la liste
          this.rapportService.getByAuteur(this.userId).subscribe({
            next: (rapports) => {
              const existant = rapports.find(
                (r: Rapport) => r.visite?.id === this.visiteSelectionnee
              );
              if (existant) {
                this.router.navigate(['/rapports', existant.id, 'edit']);
              } else {
                this.router.navigate(['/rapports']);
              }
            },
            error: () => this.router.navigate(['/rapports'])
          });
        } else {
          this.toast.error('Erreur lors de la création du rapport.');
        }
      }
    });
  }

  private soumettreRapport(rapportId: string): void {
    this.rapportService.soumettre(rapportId).subscribe({
      next: () => {
        this.loading = false;
        this.toast.success('Rapport soumis pour validation !');
        this.router.navigate(['/rapports']);
      },
      error: (err) => {
        this.loading = false;
        console.error('Erreur soumission:', err);
        this.toast.error('Erreur lors de la soumission.');
      }
    });
  }

  retour(): void {
    this.router.navigate(['/rapports']);
  }
}
