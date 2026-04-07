import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Tunnel {
  id: string;
  nom: string;
  localisation: string;
  departement: string;
  longueurM: number;
  typeTunnel: string;
  exploitantNom: string;
  periodiciteMois: number;
  statut: string;
  idMagali?: string;
  idLagora?: string;
  createdAt: string;
}

@Injectable({
  providedIn: 'root'
})
export class TunnelService {

  private apiUrl = 'http://localhost:8081/api/tunnels';

  constructor(private http: HttpClient) {}

  getAll(): Observable<Tunnel[]> {
    return this.http.get<Tunnel[]>(this.apiUrl);
  }

  getActifs(): Observable<Tunnel[]> {
    return this.http.get<Tunnel[]>(`${this.apiUrl}/actifs`);
  }

  getById(id: string): Observable<Tunnel> {
    return this.http.get<Tunnel>(`${this.apiUrl}/${id}`);
  }

  search(nom: string): Observable<Tunnel[]> {
    return this.http.get<Tunnel[]>(`${this.apiUrl}/search?nom=${nom}`);
  }

  getByExploitant(exploitantId: string): Observable<Tunnel[]> {
    return this.http.get<Tunnel[]>(`${this.apiUrl}/exploitant/${exploitantId}`);
  }
}
