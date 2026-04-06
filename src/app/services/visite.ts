import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Visite {
  id: string;
  tunnel: any;
  chargeMission: any;
  typeVisite: string;
  datePrevisionnelle: string;
  dateRealisation: string;
  statut: string;
  priorite: string;
  observations: string;
  createdAt: string;
}

@Injectable({
  providedIn: 'root'
})
export class VisiteService {

  private apiUrl = 'http://localhost:8081/api/visites';

  constructor(private http: HttpClient) {}

  getAll(): Observable<Visite[]> {
    return this.http.get<Visite[]>(this.apiUrl);
  }

  getByStatut(statut: string): Observable<Visite[]> {
    return this.http.get<Visite[]>(`${this.apiUrl}/statut/${statut}`);
  }

  getByTunnel(tunnelId: string): Observable<Visite[]> {
    return this.http.get<Visite[]>(`${this.apiUrl}/tunnel/${tunnelId}`);
  }

  getByChargeMission(userId: string): Observable<Visite[]> {
    return this.http.get<Visite[]>(`${this.apiUrl}/charge-mission/${userId}`);
  }

  getVisitesRealiseesByIntervenant(userId: string): Observable<Visite[]> {
    return this.http.get<Visite[]>(`${this.apiUrl}/intervenant/${userId}/realisees`);
  }

  getVisitesByIntervenant(userId: string): Observable<Visite[]> {
    return this.http.get<Visite[]>(`${this.apiUrl}/intervenant/${userId}`);
  }

  assignerIntervenant(visiteId: string, utilisateurId: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/${visiteId}/intervenants?utilisateurId=${utilisateurId}`, {});
  }

  marquerRealisee(id: string, dateRealisation: string): Observable<Visite> {
    return this.http.patch<Visite>(`${this.apiUrl}/${id}/realiser`, { dateRealisation });
  }

  creer(tunnelId: string, chargeMissionId: string, body: any): Observable<Visite> {
    return this.http.post<Visite>(
      `${this.apiUrl}?tunnelId=${tunnelId}&chargeMissionId=${chargeMissionId}`,
      body
    );
  }

  annuler(id: string, motif: string): Observable<Visite> {
    return this.http.patch<Visite>(`${this.apiUrl}/${id}/annuler`, { motif });
  }

  commenterVisite(id: string, commentaire: string, exploitantId: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/${id}/commentaires`, { commentaire, exploitantId });
  }
}
