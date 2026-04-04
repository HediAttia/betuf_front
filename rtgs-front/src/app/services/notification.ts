import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Notification {
  id: string;
  auteur: any;               // UtilisateurDTO ou null (système)
  destinataire: any;          // UtilisateurDTO
  typeNotification: string;
  titre: string;
  contenu: string;
  lue: boolean;
  entiteType: string;         // VISITE | RAPPORT | TUNNEL
  entiteId: string;
  createdAt: string;
}

@Injectable({
  providedIn: 'root'
})
export class NotificationService {

  private apiUrl = 'http://localhost:8081/api/notifications';

  constructor(private http: HttpClient) {}

  /** Récupérer toutes les notifications de l'utilisateur connecté */
  getMesNotifications(userId: string): Observable<Notification[]> {
    return this.http.get<Notification[]>(`${this.apiUrl}/utilisateur/${userId}`);
  }

  /** Récupérer uniquement les notifications non lues */
  getNonLues(userId: string): Observable<Notification[]> {
    return this.http.get<Notification[]>(`${this.apiUrl}/utilisateur/${userId}/non-lues`);
  }

  /** Compter les notifications non lues (pour le badge) */
  compterNonLues(userId: string): Observable<number> {
    return this.http.get<number>(`${this.apiUrl}/utilisateur/${userId}/count`);
  }

  /** Marquer une notification comme lue */
  marquerLue(notificationId: string): Observable<Notification> {
    return this.http.patch<Notification>(`${this.apiUrl}/${notificationId}/lire`, {});
  }

  /** Marquer toutes les notifications comme lues */
  marquerToutesLues(userId: string): Observable<void> {
    return this.http.patch<void>(`${this.apiUrl}/utilisateur/${userId}/tout-lire`, {});
  }
}
