import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { Tenant, CreateTenantDto } from '../models';

@Injectable({
  providedIn: 'root'
})
export class TenantService {
  private readonly baseUrl = `${environment.apiUrl}/tenants`;

  constructor(private http: HttpClient) {}

  getAll(): Observable<Tenant[]> {
    return this.http.get<Tenant[]>(this.baseUrl);
  }

  getById(id: string): Observable<Tenant> {
    return this.http.get<Tenant>(`${this.baseUrl}/${id}`);
  }

  getBySubdomain(subdomain: string): Observable<Tenant> {
    return this.http.get<Tenant>(`${this.baseUrl}/subdomain/${subdomain}`);
  }

  create(tenant: CreateTenantDto): Observable<Tenant> {
    return this.http.post<Tenant>(this.baseUrl, tenant);
  }

  update(id: string, tenant: Partial<Tenant>): Observable<Tenant> {
    return this.http.put<Tenant>(`${this.baseUrl}/${id}`, { id, ...tenant });
  }
}
