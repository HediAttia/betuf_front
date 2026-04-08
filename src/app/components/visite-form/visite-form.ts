import { Component, OnInit, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { TunnelService, Tunnel } from '../../services/tunnel';
import { UtilisateurService, Utilisateur } from '../../services/utilisateur';
import { VisiteService, Visite } from '../../services/visite';
import { AuthService } from '../../services/auth';
import { NotificationService } from '../../services/notification';

@Component({
  selector: 'app-visite-form',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatIconModule
  ],
  templateUrl: './visite-form.html',
  styleUrl: './visite-form.scss'
})
export class VisiteForm implements OnInit {

  tunnels: Tunnel[]         = [];
  ingenieurs: Utilisateur[] = [];
  chargeMissionId: string   = '';

  visite = {
    tunnelId:           '',
    ingenieurId:        '',
    typeVisite:         'PERIODIQUE',
    datePrevisionnelle: '',
    priorite:           'NORMALE'
  };

  typesVisite = ['PERIODIQUE', 'APPROFONDIE', 'PONCTUELLE', 'POST_INCIDENT'];
  priorites   = ['NORMALE', 'HAUTE', 'CRITIQUE'];

  // RG-PLAN-03 : détection de conflit
  conflitDetecte    = false;
  ingenieurVisites: Visite[] = [];
  loading = false;

  tunnelPreRempliNom: string = '';

  constructor(
    private dialogRef: MatDialogRef<VisiteForm>,
    @Inject(MAT_DIALOG_DATA) private dialogData: { tunnelId?: string; tunnelNom?: string },
    private tunnelService: TunnelService,
    private utilisateurService: UtilisateurService,
    private visiteService: VisiteService,
    private authService: AuthService,
    private notificationService: NotificationService
  ) {}

  ngOnInit(): void {
    this.chargeMissionId = this.authService.getUserId() || '';

    // Pré-remplissage depuis alerte
    if (this.dialogData?.tunnelId) {
      this.visite.tunnelId = this.dialogData.tunnelId;
      this.tunnelPreRempliNom = this.dialogData.tunnelNom || '';
    }

    this.tunnelService.getActifs().subscribe((data: Tunnel[]) => this.tunnels = data);
    this.utilisateurService.getByRole('INGENIEUR').subscribe((data: Utilisateur[]) => {
      this.ingenieurs = data;
    });
  }

  onIngenieurChange(): void {
    this.ingenieurVisites = [];
    this.conflitDetecte   = false;
    if (!this.visite.ingenieurId) return;
    this.visiteService.getVisitesByIntervenant(this.visite.ingenieurId).subscribe({
      next: (visites) => {
        this.ingenieurVisites = visites.filter(v => v.statut === 'PLANIFIEE');
        this.verifierConflit();
      },
      error: () => { this.ingenieurVisites = []; }
    });
  }

  onDateChange(): void { this.verifierConflit(); }

  private verifierConflit(): void {
    if (!this.visite.ingenieurId || !this.visite.datePrevisionnelle) {
      this.conflitDetecte = false; return;
    }
    this.conflitDetecte = this.ingenieurVisites.some(v =>
      v.datePrevisionnelle?.startsWith(this.visite.datePrevisionnelle)
    );
  }

  get ingenieurConflitLabel(): string {
    const v = this.ingenieurVisites.find(v =>
      v.datePrevisionnelle?.startsWith(this.visite.datePrevisionnelle)
    );
    return v ? `${v.tunnel?.nom ?? 'autre tunnel'} — ${v.typeVisite}` : '';
  }

  soumettre(): void {
    if (!this.visite.tunnelId || !this.visite.ingenieurId || !this.visite.datePrevisionnelle) return;
    this.loading = true;
    const body = {
      typeVisite:         this.visite.typeVisite,
      datePrevisionnelle: this.visite.datePrevisionnelle,
      priorite:           this.visite.priorite,
      statut:             'PLANIFIEE'
    };
    this.visiteService.creer(this.visite.tunnelId, this.chargeMissionId, body).subscribe({
      next: (visite) => {
        this.visiteService.assignerIntervenant(visite.id, this.visite.ingenieurId).subscribe({
          next: () => {
            this.notificationService.creer({
              destinataireId:   this.visite.ingenieurId,
              auteurId:         this.chargeMissionId,
              typeNotification: 'VISITE_ASSIGNEE',
              titre:            'Nouvelle visite assignée',
              contenu:          `Une visite ${body.typeVisite} a été planifiée et vous a été assignée.`,
              entiteType:       'VISITE',
              entiteId:         visite.id
            }).subscribe({ error: () => {} });
            this.loading = false;
            this.dialogRef.close(true);
          },
          error: () => { this.loading = false; this.dialogRef.close(true); }
        });
      },
      error: (err) => { this.loading = false; console.error(err); }
    });
  }

  annuler(): void { this.dialogRef.close(false); }
}
