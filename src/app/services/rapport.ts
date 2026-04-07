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

  getAll(): Observable<Rapport[]> {
    return this.http.get<Rapport[]>(this.apiUrl);
  }

  getById(id: string): Observable<Rapport> {
    return this.http.get<Rapport>(`${this.apiUrl}/${id}`);
  }

  getSoumis(): Observable<Rapport[]> {
    return this.http.get<Rapport[]>(`${this.apiUrl}/soumis`);
  }

  getByStatut(statut: string): Observable<Rapport[]> {
    return this.http.get<Rapport[]>(`${this.apiUrl}/statut/${statut}`);
  }

  getByAuteur(auteurId: string): Observable<Rapport[]> {
    return this.http.get<Rapport[]>(`${this.apiUrl}/auteur/${auteurId}`);
  }

  creer(visiteId: string, auteurId: string, body: any): Observable<Rapport> {
    return this.http.post<Rapport>(
      `${this.apiUrl}?visiteId=${visiteId}&auteurId=${auteurId}`,
      body
    );
  }

  soumettre(id: string): Observable<Rapport> {
    return this.http.patch<Rapport>(`${this.apiUrl}/${id}/soumettre`, {});
  }

  valider(id: string, validateurId: string): Observable<any> {
    return this.http.patch(`${this.apiUrl}/${id}/valider?validateurId=${validateurId}`, {});
  }

  corriger(id: string, commentaire: string): Observable<Rapport> {
    return this.http.patch<Rapport>(`${this.apiUrl}/${id}/corriger`, { commentaire });
  }

  modifier(id: string, body: any): Observable<Rapport> {
    return this.http.put<Rapport>(`${this.apiUrl}/${id}`, body);
  }
}
