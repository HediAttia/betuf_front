import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatTableModule } from '@angular/material/table';
import { MatChipsModule } from '@angular/material/chips';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { TunnelService, Tunnel } from '../../services/tunnel';
import { Router } from '@angular/router';

@Component({
  selector: 'app-tunnel-list',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    FormsModule,
    MatCardModule,
    MatTableModule,
    MatChipsModule,
    MatIconModule,
    MatButtonModule,
    MatInputModule,
    MatFormFieldModule
  ],
  templateUrl: './tunnel-list.html',
  styleUrl: './tunnel-list.scss'
})
export class TunnelList implements OnInit {

  tunnels: Tunnel[] = [];
  tunnelsFiltres: Tunnel[] = [];
  recherche: string = '';
  colonnes = ['nom', 'departement', 'localisation', 'longueurM', 'typeTunnel', 'exploitantNom', 'periodiciteMois', 'statut'];

  constructor(private tunnelService: TunnelService, private router: Router) {}

  ngOnInit(): void {
    this.tunnelService.getAll().subscribe((data: Tunnel[]) => {
      this.tunnels = data;
      this.tunnelsFiltres = data;
    });
  }

  filtrer(): void {
    if (!this.recherche.trim()) {
      this.tunnelsFiltres = this.tunnels;
    } else {
      this.tunnelService.search(this.recherche).subscribe((data: Tunnel[]) => {
        this.tunnelsFiltres = data;
      });
    }
  }

  getStatutColor(statut: string): string {
    switch(statut) {
      case 'ACTIF': return 'primary';
      case 'EN_TRAVAUX': return 'accent';
      case 'INACTIF': return 'warn';
      default: return '';
    }
  }

  ouvrirTunnel(tunnel: Tunnel): void {
     this.router.navigate(['/tunnels', tunnel.id]);
  }

}
