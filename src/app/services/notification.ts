import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Notification {
  id: string;
  auteur: any;
  destinataire: any;
  typeNotification: string;
  titre: string;
  contenu: string;
  lue: boolean;
  entiteType: string;   // VISITE | RAPPORT | TUNNEL
  entiteId: string;
  createdAt: string;
}

@Injectable({
  providedIn: 'root'
})
export class NotificationService {

  private apiUrl = 'http://localhost:8081/api/notifications';

  constructor(private http: HttpClient) {}

  getMesNotifications(userId: string): Observable<Notification[]> {
    return this.http.get<Notification[]>(`${this.apiUrl}/utilisateur/${userId}`);
  }

  getNonLues(userId: string): Observable<Notification[]> {
    return this.http.get<Notification[]>(`${this.apiUrl}/utilisateur/${userId}/non-lues`);
  }

  compterNonLues(userId: string): Observable<number> {
    return this.http.get<number>(`${this.apiUrl}/utilisateur/${userId}/count`);
  }

  marquerLue(notificationId: string): Observable<Notification> {
    return this.http.patch<Notification>(`${this.apiUrl}/${notificationId}/lire`, {});
  }

  marquerToutesLues(userId: string): Observable<void> {
    return this.http.patch<void>(`${this.apiUrl}/utilisateur/${userId}/tout-lire`, {});
  }
}
