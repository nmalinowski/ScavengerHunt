import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class HuntService {
  private apiUrl = 'http://localhost:3000/api/hunts';

  constructor(private http: HttpClient) {}

  createHunt(hunt: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/create`, hunt);
  }

  getHuntByCode(code: string): Observable<any> {
    return this.http.get(`${this.apiUrl}/${code}`);
  }

  joinHunt(code: string, name: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/join`, { code, name });
  }

  validateAdmin(code: string, adminPassword: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/validate-admin`, { code, adminPassword });
  }
}