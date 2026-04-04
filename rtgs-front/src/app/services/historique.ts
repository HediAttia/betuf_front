import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface HistoriqueStatut {
  id: string;
  entiteType: string;       // VISITE | RAPPORT
  entiteId: string;
  ancienStatut: string;
  nouveauStatut: string;
  commentaire: string | null;
  utilisateur: {
    id: string;
    nom: string;
    prenom: string;
    email: string;
    role: string;
  };
  createdAt: string;
}

@Injectable({
  providedIn: 'root'
})
export class HistoriqueService {

  private apiUrl = 'http://localhost:8081/api/historique';

  constructor(private http: HttpClient) {}

  /** Historique des transitions d'un rapport */
  getHistoriqueRapport(rapportId: string): Observable<HistoriqueStatut[]> {
    return this.http.get<HistoriqueStatut[]>(`${this.apiUrl}/RAPPORT/${rapportId}`);
  }

  /** Historique des transitions d'une visite */
  getHistoriqueVisite(visiteId: string): Observable<HistoriqueStatut[]> {
    return this.http.get<HistoriqueStatut[]>(`${this.apiUrl}/VISITE/${visiteId}`);
  }

  /** Activité récente globale */
  getActiviteRecente(): Observable<HistoriqueStatut[]> {
    return this.http.get<HistoriqueStatut[]>(`${this.apiUrl}/recent`);
  }
}
