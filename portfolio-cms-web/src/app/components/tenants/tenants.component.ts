import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TenantService } from '../../services/tenant.service';
import { Tenant } from '../../models';
import { TranslatePipe } from '../../pipes/translate.pipe';
import { TranslationService } from '../../services/translation.service';

@Component({
  selector: 'app-tenants',
  imports: [CommonModule, TranslatePipe],
  templateUrl: './tenants.component.html',
  styleUrl: './tenants.component.scss'
})
export class TenantsComponent implements OnInit {
  tenants: Tenant[] = [];
  loading = true;
  error: string | null = null;

  constructor(
    private tenantService: TenantService,
    private translationService: TranslationService
  ) {}

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
    return isActive ? this.translationService.t('tenants.active') : this.translationService.t('tenants.inactive');
  }
}
