import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject, tap } from 'rxjs';
import { environment } from '../../environments/environment';
import { LoginRequest, AuthResult } from '../models';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private readonly TOKEN_KEY = 'portfolio_jwt_token';
  private readonly USER_ID_KEY = 'portfolio_user_id';
  private readonly TENANT_ID_KEY = 'portfolio_tenant_id';
  
  private isAuthenticatedSubject = new BehaviorSubject<boolean>(this.hasToken());
  public isAuthenticated$ = this.isAuthenticatedSubject.asObservable();

  private currentUserIdSubject = new BehaviorSubject<string | null>(this.getUserId());
  public currentUserId$ = this.currentUserIdSubject.asObservable();

  constructor(private http: HttpClient) {}

  login(email: string, password: string, tenantId: string): Observable<AuthResult> {
    const request: LoginRequest = { email, password, tenantId };

    return this.http.post<AuthResult>(`${environment.apiUrl}/auth/login`, request)
      .pipe(
        tap(result => {
          if (result.success && result.token) {
            this.setToken(result.token);
            this.setUserId(result.userId!);
            this.setTenantId(tenantId);
            this.isAuthenticatedSubject.next(true);
            this.currentUserIdSubject.next(result.userId!);
          }
        })
      );
  }

  logout(): void {
    localStorage.removeItem(this.TOKEN_KEY);
    localStorage.removeItem(this.USER_ID_KEY);
    localStorage.removeItem(this.TENANT_ID_KEY);
    this.isAuthenticatedSubject.next(false);
    this.currentUserIdSubject.next(null);
  }

  getToken(): string | null {
    return localStorage.getItem(this.TOKEN_KEY);
  }

  getUserId(): string | null {
    return localStorage.getItem(this.USER_ID_KEY);
  }

  getTenantId(): string | null {
    return localStorage.getItem(this.TENANT_ID_KEY);
  }

  setTenantId(tenantId: string): void {
    localStorage.setItem(this.TENANT_ID_KEY, tenantId);
    environment.tenantId = tenantId;
  }

  private setToken(token: string): void {
    localStorage.setItem(this.TOKEN_KEY, token);
  }

  private setUserId(userId: string): void {
    localStorage.setItem(this.USER_ID_KEY, userId);
  }

  private hasToken(): boolean {
    return !!this.getToken();
  }
}
