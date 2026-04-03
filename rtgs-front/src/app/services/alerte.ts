import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Alerte {
  tunnelId: string;
  tunnelNom: string;
  localisation: string;
  joursRestants: number;
  dateProchaine: string;
  periodiciteMois: number;
  niveau: string;
}

@Injectable({
  providedIn: 'root'
})
export class AlerteService {

  private apiUrl = 'http://localhost:8081/api/alertes';

  constructor(private http: HttpClient) {}

  getAlertesJ180(): Observable<Alerte[]> {
    return this.http.get<Alerte[]>(`${this.apiUrl}/j180`);
  }
}
