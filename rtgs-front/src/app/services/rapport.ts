import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Rapport {
  id: string;
  visite: any;
  auteur: any;
  validateur: any;
  statut: string;
  version: number;
  constats: string;
  nonConformites: string;
  recommandations: string;
  commentaireRejet: string;
  dateSoumission: string;
  dateValidation: string;
  createdAt: string;
}

@Injectable({
  providedIn: 'root'
})
export class RapportService {

  private apiUrl = 'http://localhost:8081/api/rapports';

  constructor(private http: HttpClient) {}

  // GET /api/rapports
  getAll(): Observable<Rapport[]> {
    return this.http.get<Rapport[]>(this.apiUrl);
  }

  // GET /api/rapports/{id}
  getById(id: string): Observable<Rapport> {
    return this.http.get<Rapport>(`${this.apiUrl}/${id}`);
  }

  // GET /api/rapports/statut/{statut}
  getByStatut(statut: string): Observable<Rapport[]> {
    return this.http.get<Rapport[]>(`${this.apiUrl}/statut/${statut}`);
  }

  // GET /api/rapports/auteur/{auteurId}
  getByAuteur(auteurId: string): Observable<Rapport[]> {
    return this.http.get<Rapport[]>(`${this.apiUrl}/auteur/${auteurId}`);
  }

  /**
   * POST /api/rapports?visiteId=...&auteurId=...
   * Body = objet avec constats, recommandations, nonConformites
   * Le backend attend @RequestBody Rapport, Spring mappe les champs correspondants
   */
  creer(visiteId: string, auteurId: string, body: {
    constats: string;
    recommandations: string;
    nonConformites: string;
  }): Observable<Rapport> {
    return this.http.post<Rapport>(
      `${this.apiUrl}?visiteId=${visiteId}&auteurId=${auteurId}`,
      body
    );
  }

  /**
   * PUT /api/rapports/{id}
   * Modifier un brouillon ou rapport rejeté
   */
  modifier(id: string, body: {
    constats: string;
    recommandations: string;
    nonConformites: string;
  }): Observable<Rapport> {
    return this.http.put<Rapport>(`${this.apiUrl}/${id}`, body);
  }

  // PATCH /api/rapports/{id}/soumettre
  soumettre(id: string): Observable<Rapport> {
    return this.http.patch<Rapport>(`${this.apiUrl}/${id}/soumettre`, {});
  }

  // PATCH /api/rapports/{id}/valider?validateurId=...
  valider(id: string, validateurId: string): Observable<any> {
    return this.http.patch(`${this.apiUrl}/${id}/valider?validateurId=${validateurId}`, {});
  }

  // PATCH /api/rapports/{id}/retourner
  retourner(id: string, commentaire: string): Observable<Rapport> {
    return this.http.patch<Rapport>(`${this.apiUrl}/${id}/retourner`, { commentaire });
  }
}
