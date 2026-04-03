import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, ActivatedRoute } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTabsModule } from '@angular/material/tabs';
import { MatChipsModule } from '@angular/material/chips';
import { MatTooltipModule } from '@angular/material/tooltip';
import { RapportService, Rapport } from '../../services/rapport';
import { AuthService } from '../../services/auth';
import { ToastService } from '../../services/toast';

@Component({
  selector: 'app-rapport-list',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatTabsModule,
    MatChipsModule,
    MatTooltipModule
  ],
  templateUrl: './rapport-list.html',
  styleUrl: './rapport-list.scss'
})
export class RapportList implements OnInit {

  activeTab: number = 0;
  userId: string = '';
  userRole: string = '';

  // Listes
  allRapports: Rapport[] = [];
  aValider: Rapport[] = [];       // Soumis (pour le chargé de mission)
  brouillons: Rapport[] = [];
  soumis: Rapport[] = [];
  valides: Rapport[] = [];
  aCorrection: Rapport[] = [];    // A_CORRIGER
  loading: boolean = true;

  get isChargeMission(): boolean {
    return this.userRole === 'CHARGE_MISSION';
  }

  get isIngenieur(): boolean {
    return this.userRole === 'INGENIEUR';
  }

  constructor(
    private rapportService: RapportService,
    private authService: AuthService,
    private router: Router,
    private route: ActivatedRoute,
    private toast: ToastService
  ) {}

  ngOnInit(): void {
    this.userId = this.authService.getUserId() || '';
    this.userRole = this.authService.getRole() || '';

    const tabParam = this.route.snapshot.queryParamMap.get('tab');
    if (tabParam) {
      this.activeTab = parseInt(tabParam, 10) || 0;
    }

    this.chargerRapports();
  }

  chargerRapports(): void {
    this.loading = true;

    // Chargé de mission → voit TOUS les rapports
    // Ingénieur → voit seulement les siens
    const source$ = this.isChargeMission
      ? this.rapportService.getAll()
      : this.rapportService.getByAuteur(this.userId);

    source$.subscribe({
      next: (rapports: Rapport[]) => {
        this.allRapports = rapports;
        this.aValider = rapports.filter(r => r.statut === 'SOUMIS');
        this.brouillons = rapports.filter(r => r.statut === 'BROUILLON');
        this.soumis = rapports.filter(r => r.statut === 'SOUMIS');
        this.valides = rapports.filter(r => r.statut === 'VALIDE');
        this.aCorrection = rapports.filter(r => r.statut === 'A_CORRIGER');
        this.loading = false;
      },
      error: () => {
        this.loading = false;
        this.toast.error('Erreur lors du chargement des rapports.');
      }
    });
  }

  creerRapport(): void {
    this.router.navigate(['/rapports/nouveau']);
  }

  ouvrirRapport(rapport: Rapport): void {
    // Ingénieur : brouillon/correction → édition, sinon détail
    // Chargé de mission : toujours vue détail (avec boutons valider/retourner)
    if (this.isIngenieur && (rapport.statut === 'BROUILLON' || rapport.statut === 'A_CORRIGER')) {
      this.router.navigate(['/rapports', rapport.id, 'edit']);
    } else {
      this.router.navigate(['/rapports', rapport.id]);
    }
  }

  getStatutClass(statut: string): string {
    const classes: Record<string, string> = {
      BROUILLON: 'statut-brouillon',
      SOUMIS: 'statut-soumis',
      VALIDE: 'statut-valide',
      A_CORRIGER: 'statut-a-corriger'
    };
    return classes[statut] || '';
  }

  getStatutLabel(statut: string): string {
    const labels: Record<string, string> = {
      BROUILLON: 'Brouillon',
      SOUMIS: 'En validation',
      VALIDE: 'Validé',
      A_CORRIGER: 'À corriger'
    };
    return labels[statut] || statut;
  }

  getStatutIcon(statut: string): string {
    const icons: Record<string, string> = {
      BROUILLON: 'edit_note',
      SOUMIS: 'hourglass_top',
      VALIDE: 'check_circle',
      A_CORRIGER: 'replay'
    };
    return icons[statut] || 'help';
  }
}
