import { Component, OnInit, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatBadgeModule } from '@angular/material/badge';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatDividerModule } from '@angular/material/divider';
import { NotificationService, Notification } from '../../services/notification';
import { AuthService } from '../../services/auth';

@Component({
  selector: 'app-notification-panel',
  standalone: true,
  imports: [
    CommonModule,
    MatIconModule,
    MatButtonModule,
    MatBadgeModule,
    MatTooltipModule,
    MatDividerModule
  ],
  templateUrl: './notification-panel.html',
  styleUrl: './notification-panel.scss'
})
export class NotificationPanel implements OnInit {

  @Input() maxItems: number = 8;

  notifications: Notification[] = [];
  nonLues: Notification[] = [];
  panelOpen: boolean = false;
  userId: string = '';

  constructor(
    private notificationService: NotificationService,
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.userId = this.authService.getUserId() || '';
    if (this.userId) {
      this.charger();
    }
  }

  charger(): void {
    this.notificationService.getMesNotifications(this.userId).subscribe({
      next: (data) => {
        this.notifications = data.slice(0, this.maxItems);
        this.nonLues = data.filter(n => !n.lue);
        if (this.nonLues.length > 0) {
          this.panelOpen = true;
        }
      },
      error: () => {
        this.notifications = [];
        this.nonLues = [];
      }
    });
  }

  togglePanel(): void {
    this.panelOpen = !this.panelOpen;
  }

  ouvrirNotification(notif: Notification): void {
    if (!notif.lue) {
      this.notificationService.marquerLue(notif.id).subscribe({
        next: () => {
          notif.lue = true;
          this.nonLues = this.notifications.filter(n => !n.lue);
        }
      });
    }

    if (notif.entiteType === 'RAPPORT' && notif.entiteId) {
      this.router.navigate(['/rapports', notif.entiteId]);
    } else if (notif.entiteType === 'VISITE' && notif.entiteId) {
      this.router.navigate(['/rapports']);
    } else if (notif.entiteType === 'TUNNEL' && notif.entiteId) {
      this.router.navigate(['/tunnels', notif.entiteId]);
    }
  }

  marquerToutesLues(): void {
    this.notificationService.marquerToutesLues(this.userId).subscribe({
      next: () => {
        this.notifications.forEach(n => n.lue = true);
        this.nonLues = [];
      }
    });
  }

  voirToutes(): void {
    this.maxItems = 50;
    this.charger();
  }

  trackNotif(index: number, notif: Notification): string {
    return notif.id;
  }

  getTypeIcon(type: string): string {
    const icons: Record<string, string> = {
      'ALERTE_ECHEANCE': 'warning',
      'VISITE_ASSIGNEE': 'assignment_ind',
      'VISITE_PLANIFIEE': 'event',
      'RAPPORT_SOUMIS': 'send',
      'RAPPORT_VALIDE': 'check_circle',
      'RAPPORT_A_CORRIGER': 'replay',
      'RAPPORT_CORRIGE': 'send',
      'NC_CRITIQUE': 'error'
    };
    return icons[type] || 'notifications';
  }

  getTypeClass(type: string): string {
    const classes: Record<string, string> = {
      'ALERTE_ECHEANCE': 'type-alerte',
      'VISITE_ASSIGNEE': 'type-visite',
      'VISITE_PLANIFIEE': 'type-visite',
      'RAPPORT_SOUMIS': 'type-rapport',
      'RAPPORT_VALIDE': 'type-validation',
      'RAPPORT_A_CORRIGER': 'type-correction',
      'RAPPORT_CORRIGE': 'type-rapport',
      'NC_CRITIQUE': 'type-nc'
    };
    return classes[type] || 'type-visite';
  }

  formatDate(dateStr: string): string {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(hours / 24);

    if (hours < 1) return "À l'instant";
    if (hours < 24) return `Il y a ${hours}h`;
    if (days === 1) return 'Hier';
    if (days < 7) return `Il y a ${days} jours`;
    return date.toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' });
  }
}
