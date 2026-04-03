import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatIconModule } from '@angular/material/icon';
import { TunnelService, Tunnel } from '../../services/tunnel';
import { UtilisateurService, Utilisateur } from '../../services/utilisateur';
import { VisiteService } from '../../services/visite';
import { AuthService } from '../../services/auth';

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
    MatDatepickerModule,
    MatNativeDateModule,
    MatIconModule
  ],
  templateUrl: './visite-form.html',
  styleUrl: './visite-form.scss'
})
export class VisiteForm implements OnInit {

  tunnels: Tunnel[] = [];
  ingenieurs: Utilisateur[] = [];

  visite = {
    tunnelId: '',
    ingenieurId: '',
    typeVisite: 'PERIODIQUE',
    datePrevisionnelle: '',
    priorite: 'NORMALE'
  };

  typesVisite = ['PERIODIQUE', 'APPROFONDIE', 'PONCTUELLE', 'POST_INCIDENT'];
  priorites = ['NORMALE', 'HAUTE', 'CRITIQUE'];

  chargeMissionId: string = '';

  constructor(
    private dialogRef: MatDialogRef<VisiteForm>,
    private tunnelService: TunnelService,
    private utilisateurService: UtilisateurService,
    private visiteService: VisiteService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.chargeMissionId = this.authService.getUserId() || '';
    this.tunnelService.getActifs().subscribe((data: Tunnel[]) => this.tunnels = data);
    this.utilisateurService.getByRole('INGENIEUR').subscribe((data: Utilisateur[]) => {
      this.ingenieurs = data;
    });
  }

  soumettre(): void {
    if (!this.visite.tunnelId || !this.visite.ingenieurId || !this.visite.datePrevisionnelle) {
      return;
    }

    const body = {
      typeVisite: this.visite.typeVisite,
      datePrevisionnelle: this.visite.datePrevisionnelle,
      priorite: this.visite.priorite,
      statut: 'PLANIFIEE'
    };

    this.visiteService.creer(this.visite.tunnelId, this.chargeMissionId, body).subscribe({
      next: (visite) => {
        // Assigner l'ingénieur via visite_intervenant
        this.visiteService.assignerIntervenant(visite.id, this.visite.ingenieurId).subscribe({
          next: () => this.dialogRef.close(true),
          error: () => this.dialogRef.close(true)
        });
      },
      error: (err) => console.error(err)
    });
  }

  annuler(): void {
    this.dialogRef.close(false);
  }
}
