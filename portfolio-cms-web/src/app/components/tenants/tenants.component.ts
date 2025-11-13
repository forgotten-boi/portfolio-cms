import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TenantService } from '../../services/tenant.service';
import { Tenant } from '../../models';

@Component({
  selector: 'app-tenants',
  imports: [CommonModule],
  templateUrl: './tenants.component.html',
  styleUrl: './tenants.component.scss'
})
export class TenantsComponent implements OnInit {
  tenants: Tenant[] = [];
  loading = true;
  error: string | null = null;

  constructor(private tenantService: TenantService) {}

  ngOnInit(): void {
    this.loadTenants();
  }

  loadTenants(): void {
    this.loading = true;
    this.error = null;
    
    this.tenantService.getAll().subscribe({
      next: (tenants) => {
        this.tenants = tenants;
        this.loading = false;
      },
      error: (err) => {
        this.error = 'Failed to load tenants';
        this.loading = false;
        console.error('Error loading tenants:', err);
      }
    });
  }

  getStatusClass(isActive: boolean): string {
    return isActive ? 'status-active' : 'status-inactive';
  }

  getStatusText(isActive: boolean): string {
    return isActive ? 'Active' : 'Inactive';
  }
}
