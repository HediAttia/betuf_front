import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatTableModule } from '@angular/material/table';
import { MatChipsModule } from '@angular/material/chips';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatBadgeModule } from '@angular/material/badge';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { TunnelService, Tunnel } from '../../services/tunnel';
import { VisiteService, Visite } from '../../services/visite';
import { AlerteService, Alerte } from '../../services/alerte';
import { VisiteForm } from '../visite-form/visite-form';
import { AnnulationDialog } from '../annulation-dialog/annulation-dialog';
import { NotificationPanel } from '../notification-panel/notification-panel';
import { forkJoin, of } from 'rxjs';
import { catchError } from 'rxjs/operators';

export interface CalendarDay {
  date: Date;
  dateStr: string;
  isCurrentMonth: boolean;
  isToday: boolean;
  visites: Visite[];
}

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterModule,
    MatCardModule,
    MatTableModule,
    MatChipsModule,
    MatIconModule,
    MatButtonModule,
    NotificationPanel,
    MatBadgeModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatSnackBarModule
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

  // Calendrier
  moisCourant: Date = new Date();
  joursCalendrier: CalendarDay[] = [];
  joursNoms = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'];
  moisNoms = ['Janvier','Février','Mars','Avril','Mai','Juin','Juillet','Août','Septembre','Octobre','Novembre','Décembre'];
  visiteSelectionnee: Visite | null = null;

  constructor(
    private tunnelService: TunnelService,
    private visiteService: VisiteService,
    private alerteService: AlerteService,
    private dialog: MatDialog,
    private snackBar: MatSnackBar
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
        this.visitesRealisees   = visites.filter((v: Visite) => v.statut === 'REALISEE');
        this.alertes = alertes;
        this.buildCalendar();
      }
    });
  }

  // ── Calendrier ────────────────────────────────

  get moisLabel(): string {
    return `${this.moisNoms[this.moisCourant.getMonth()]} ${this.moisCourant.getFullYear()}`;
  }

  buildCalendar(): void {
    const year  = this.moisCourant.getFullYear();
    const month = this.moisCourant.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay  = new Date(year, month + 1, 0);

    const startDate = new Date(firstDay);
    const dow = firstDay.getDay();
    startDate.setDate(startDate.getDate() - (dow === 0 ? 6 : dow - 1));

    const endDate = new Date(lastDay);
    const dowEnd  = lastDay.getDay();
    if (dowEnd !== 0) endDate.setDate(endDate.getDate() + (7 - dowEnd));

    this.joursCalendrier = [];
    const today = this.toDateStr(new Date());
    const cur = new Date(startDate);

    while (cur <= endDate) {
      const ds = this.toDateStr(cur);
      this.joursCalendrier.push({
        date: new Date(cur),
        dateStr: ds,
        isCurrentMonth: cur.getMonth() === month,
        isToday: ds === today,
        visites: this.visitesPlannifiees.filter(v => v.datePrevisionnelle?.startsWith(ds))
      });
      cur.setDate(cur.getDate() + 1);
    }
  }

  private toDateStr(d: Date): string {
    return d.toISOString().split('T')[0];
  }

  moisPrecedent(): void {
    this.moisCourant = new Date(this.moisCourant.getFullYear(), this.moisCourant.getMonth() - 1, 1);
    this.buildCalendar();
  }

  moisSuivant(): void {
    this.moisCourant = new Date(this.moisCourant.getFullYear(), this.moisCourant.getMonth() + 1, 1);
    this.buildCalendar();
  }

  selectionnerJour(day: CalendarDay): void {
    this.visiteSelectionnee = day.visites.length > 0 ? day.visites[0] : null;
  }

  private findTunnel(visite: Visite): any {
    // Cas 1 : tunnel objet complet
    if (visite.tunnel?.nom) return visite.tunnel;
    // Cas 2 : tunnel = objet partiel avec id
    const id = visite.tunnel?.id ?? (visite as any).tunnelId ?? null;
    if (id) return this.tunnels.find(t => t.id === id) ?? null;
    return null;
  }

  getTunnelNom(visite: Visite): string {
    const t = this.findTunnel(visite);
    return t?.nom || '—';
  }

  getTunnelLoc(visite: Visite): string {
    const t = this.findTunnel(visite);
    return t?.localisation || '';
  }

  getPrioriteClass(priorite: string): string {
    switch (priorite) {
      case 'CRITIQUE': return 'pill-red';
      case 'HAUTE':    return 'pill-amber';
      default:         return 'pill-blue';
    }
  }

  // ── Planifier ─────────────────────────────────

  planifierVisite(): void {
    const dialogRef = this.dialog.open(VisiteForm, { width: '660px', panelClass: 'custom-dialog', data: {} });
    dialogRef.afterClosed().subscribe((result: boolean) => {
      if (result) this.ngOnInit();
    });
  }

  planifierDepuisAlerte(alerte: any): void {
    const dialogRef = this.dialog.open(VisiteForm, {
      width: '660px',
      panelClass: 'custom-dialog',
      data: { tunnelId: alerte.tunnelId, tunnelNom: alerte.tunnelNom }
    });
    dialogRef.afterClosed().subscribe((result: boolean) => {
      if (result) this.ngOnInit();
    });
  }

  // ── Annuler visite (RG-PLAN-05) ───────────────

  annulerVisite(visite: Visite): void {
    const dialogRef = this.dialog.open(AnnulationDialog, {
      width: '520px',
      data: { visite },
      panelClass: 'custom-dialog'
    });
    dialogRef.afterClosed().subscribe((motif: string) => {
      if (motif) {
        this.visiteService.annuler(visite.id, motif).subscribe({
          next: () => {
            this.snackBar.open('Visite annulée.', 'Fermer', { duration: 3000 });
            this.ngOnInit();
          },
          error: () => this.snackBar.open('Erreur lors de l\'annulation.', 'Fermer', { duration: 3000 })
        });
      }
    });
  }
}
