import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatTableModule } from '@angular/material/table';
import { MatChipsModule } from '@angular/material/chips';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatBadgeModule } from '@angular/material/badge';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';
import { TunnelService, Tunnel } from '../../services/tunnel';
import { VisiteService, Visite } from '../../services/visite';
import { AlerteService, Alerte } from '../../services/alerte';
import { VisiteForm } from '../visite-form/visite-form';
import { forkJoin, of } from 'rxjs';
import { catchError } from 'rxjs/operators';

@Component({
  selector: 'app-dashboard',
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
    MatDialogModule
  ],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.scss'
})
export class DashboardComponent implements OnInit {

  tunnels: Tunnel[] = [];
  visites: Visite[] = [];
  visitesRealisees: Visite[] = [];
  visitesPlannifiees: Visite[] = [];
  alertes: Alerte[] = [];

  colonnesAlertes = ['tunnel', 'joursRestants', 'dateProchaine', 'niveau', 'actions'];
  colonnesTunnels = ['nom', 'localisation', 'longueurM', 'statut'];
  colonnesVisites = ['tunnel', 'typeVisite', 'datePrevisionnelle', 'statut', 'priorite'];

  constructor(
    private tunnelService: TunnelService,
    private visiteService: VisiteService,
    private alerteService: AlerteService,
    private dialog: MatDialog
  ) {}

  ngOnInit(): void {
    const token = localStorage.getItem('token');
    if (!token) return;

    forkJoin({
      tunnels: this.tunnelService.getActifs().pipe(catchError(() => of([]))),
      visites: this.visiteService.getAll().pipe(catchError(() => of([]))),
      alertes: this.alerteService.getAlertesJ180().pipe(catchError(() => of([])))
    }).subscribe({
      next: ({ tunnels, visites, alertes }) => {
        this.tunnels = tunnels;
        this.visites = visites;
        this.visitesPlannifiees = visites.filter((v: Visite) => v.statut === 'PLANIFIEE');
        this.visitesRealisees = visites.filter((v: Visite) => v.statut === 'REALISEE');
        this.alertes = alertes;
      }
    });
  }

  getStatutColor(statut: string): string {
    switch(statut) {
      case 'PLANIFIEE': return 'primary';
      case 'REALISEE': return 'accent';
      case 'CLOTUREE': return 'warn';
      default: return '';
    }
  }

  getPrioriteColor(priorite: string): string {
    switch(priorite) {
      case 'CRITIQUE': return 'warn';
      case 'HAUTE': return 'accent';
      default: return 'primary';
    }
  }

  getNiveauColor(niveau: string): string {
    switch(niveau) {
      case 'CRITIQUE': return 'warn';
      case 'URGENT': return 'warn';
      case 'ATTENTION': return 'accent';
      default: return 'primary';
    }
  }

  planifierVisite(): void {
    const dialogRef = this.dialog.open(VisiteForm, { width: '560px' });
    dialogRef.afterClosed().subscribe((result: boolean) => {
      if (result) this.ngOnInit();
    });
  }
}
