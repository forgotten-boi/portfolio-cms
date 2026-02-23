import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { SettingsService } from '../../services/settings.service';
import { TranslatePipe } from '../../pipes/translate.pipe';

@Component({
  selector: 'app-login',
  imports: [CommonModule, FormsModule, RouterModule, TranslatePipe],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss'
})
export class LoginComponent implements OnInit {
  email = '';
  password = '';
  tenantId = '';
  error = '';
  loading = false;
  showTenantId = false;

  constructor(
    private authService: AuthService,
    private router: Router,
    private settingsService: SettingsService
  ) {}

  ngOnInit(): void {
    this.showTenantId = this.settingsService.showTenantId;
    if (!this.showTenantId) {
      this.tenantId = this.settingsService.defaultTenantId;
    }
    this.settingsService.settings$.subscribe(s => {
      this.showTenantId = s.showTenantId;
      if (!this.showTenantId) {
        this.tenantId = s.defaultTenantId;
      }
    });
  }

  get isFormValid(): boolean {
    if (!this.email || !this.password) return false;
    if (this.showTenantId && !this.tenantId) return false;
    return true;
  }

  login(): void {
    if (!this.email || !this.password) {
      this.error = 'Please fill in email and password';
      return;
    }

    // Use default tenant if tenantId field is hidden or empty
    const effectiveTenantId = this.tenantId || this.settingsService.defaultTenantId;

    this.loading = true;
    this.error = '';

    this.authService.login(this.email, this.password, effectiveTenantId).subscribe({
      next: (result) => {
        this.loading = false;
        if (result.success) {
          this.router.navigate(['/dashboard']);
        } else {
          this.error = result.error || 'Login failed';
        }
      },
      error: (err) => {
        this.loading = false;
        this.error = err.error?.detail || 'An error occurred during login';
        console.error(err);
      }
    });
  }
}
