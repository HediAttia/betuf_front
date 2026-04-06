import { Component, OnInit } from '@angular/core';
import { CommonModule, DecimalPipe } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { TunnelService, Tunnel } from '../../services/tunnel';

@Component({
  selector: 'app-tunnel-list',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    FormsModule,
    DecimalPipe
  ],
  templateUrl: './tunnel-list.html',
  styleUrl: './tunnel-list.scss'
})
export class TunnelList implements OnInit {

  tunnels: Tunnel[] = [];
  tunnelsFiltres: Tunnel[] = [];
  recherche: string = '';
  filtreType: string = '';
  tunnelSelectionne: Tunnel | null = null;

  constructor(private tunnelService: TunnelService) {}

  ngOnInit(): void {
    this.tunnelService.getAll().subscribe((data: Tunnel[]) => {
      this.tunnels = data;
      this.tunnelsFiltres = data;
    });
  }

  filtrer(): void {
    this.appliquerFiltres();
  }

  filtrerType(type: string): void {
    this.filtreType = type;
    this.appliquerFiltres();
  }

  private appliquerFiltres(): void {
    let res = this.tunnels;
    if (this.recherche.trim()) {
      const q = this.recherche.toLowerCase();
      res = res.filter(t =>
        t.nom?.toLowerCase().includes(q) ||
        t.localisation?.toLowerCase().includes(q) ||
        t.departement?.toLowerCase().includes(q)
      );
    }
    if (this.filtreType) {
      res = res.filter(t => t.typeTunnel === this.filtreType);
    }
    this.tunnelsFiltres = res;
  }

  selectionner(t: Tunnel): void {
    this.tunnelSelectionne = this.tunnelSelectionne?.id === t.id ? null : t;
  }

  getTypeClass(type: string): string {
    switch (type) {
      case 'ROUTIER': return 'type-routier';
      case 'FERROVIAIRE': return 'type-ferroviaire';
      case 'MIXTE': return 'type-mixte';
      default: return '';
    }
  }

  getStatutColor(statut: string): string {
    switch (statut) {
      case 'ACTIF': return 'primary';
      case 'EN_TRAVAUX': return 'accent';
      case 'INACTIF': return 'warn';
      default: return '';
    }
  }
}
