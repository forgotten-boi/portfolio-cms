import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { Portfolio, CreatePortfolioDto } from '../models';

@Injectable({
  providedIn: 'root'
})
export class PortfolioService {
  private readonly baseUrl = `${environment.apiUrl}/portfolios`;

  constructor(private http: HttpClient) {}

  getAll(): Observable<Portfolio[]> {
    return this.http.get<Portfolio[]>(this.baseUrl);
  }

  getById(id: string): Observable<Portfolio> {
    return this.http.get<Portfolio>(`${this.baseUrl}/${id}`);
  }

  getByUserId(userId: string): Observable<Portfolio> {
    return this.http.get<Portfolio>(`${this.baseUrl}/user/${userId}`);
  }

  create(portfolio: CreatePortfolioDto): Observable<Portfolio> {
    return this.http.post<Portfolio>(this.baseUrl, portfolio);
  }

  update(id: string, portfolio: CreatePortfolioDto): Observable<Portfolio> {
    return this.http.put<Portfolio>(`${this.baseUrl}/${id}`, { id, ...portfolio });
  }

  delete(id: string): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }

  importFromLinkedIn(userId: string, linkedInData: any): Observable<Portfolio> {
    return this.http.post<Portfolio>(`${this.baseUrl}/import/linkedin`, {
      userId,
      linkedInData
    });
  }

  importFromResume(userId: string, resumeData: any): Observable<Portfolio> {
    return this.http.post<Portfolio>(`${this.baseUrl}/import/resume`, {
      userId,
      resumeData
    });
  }
}
