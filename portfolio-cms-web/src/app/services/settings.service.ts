import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

export interface AppSettings {
  showTenantId: boolean;
  defaultTenantId: string;
}

const SETTINGS_KEY = 'portfolio_app_settings';

const DEFAULT_SETTINGS: AppSettings = {
  showTenantId: false,
  defaultTenantId: '00000000-0000-0000-0000-000000000001'
};

@Injectable({
  providedIn: 'root'
})
export class SettingsService {
  private settingsSubject = new BehaviorSubject<AppSettings>(this.loadSettings());
  public settings$ = this.settingsSubject.asObservable();

  get settings(): AppSettings {
    return this.settingsSubject.value;
  }

  private loadSettings(): AppSettings {
    try {
      const stored = localStorage.getItem(SETTINGS_KEY);
      if (stored) {
        return { ...DEFAULT_SETTINGS, ...JSON.parse(stored) };
      }
    } catch {
      // ignore parse errors
    }
    return { ...DEFAULT_SETTINGS };
  }

  saveSettings(settings: Partial<AppSettings>): void {
    const updated = { ...this.settings, ...settings };
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(updated));
    this.settingsSubject.next(updated);
  }

  get showTenantId(): boolean {
    return this.settings.showTenantId;
  }

  get defaultTenantId(): string {
    return this.settings.defaultTenantId;
  }
}
