import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

export type ThemeMode = 'light' | 'dark';
export type ThemeColor = 'default' | 'skyblue' | 'green';

export interface ThemeConfig {
  mode: ThemeMode;
  color: ThemeColor;
}

const THEME_KEY = 'portfolio_theme';

const DEFAULT_THEME: ThemeConfig = {
  mode: 'light',
  color: 'default'
};

@Injectable({
  providedIn: 'root'
})
export class ThemeService {
  private themeSubject = new BehaviorSubject<ThemeConfig>(this.loadTheme());
  public theme$ = this.themeSubject.asObservable();

  get theme(): ThemeConfig {
    return this.themeSubject.value;
  }

  get mode(): ThemeMode {
    return this.theme.mode;
  }

  get color(): ThemeColor {
    return this.theme.color;
  }

  constructor() {
    this.applyTheme(this.theme);
  }

  private loadTheme(): ThemeConfig {
    try {
      const stored = localStorage.getItem(THEME_KEY);
      if (stored) {
        return { ...DEFAULT_THEME, ...JSON.parse(stored) };
      }
    } catch {
      // ignore
    }
    return { ...DEFAULT_THEME };
  }

  setTheme(config: Partial<ThemeConfig>): void {
    const updated = { ...this.theme, ...config };
    localStorage.setItem(THEME_KEY, JSON.stringify(updated));
    this.themeSubject.next(updated);
    this.applyTheme(updated);
  }

  toggleMode(): void {
    this.setTheme({ mode: this.mode === 'light' ? 'dark' : 'light' });
  }

  setColor(color: ThemeColor): void {
    this.setTheme({ color });
  }

  private applyTheme(config: ThemeConfig): void {
    const body = document.body;
    // Remove all theme classes
    body.classList.remove(
      'theme-light', 'theme-dark',
      'color-default', 'color-skyblue', 'color-green'
    );
    // Apply new theme classes
    body.classList.add(`theme-${config.mode}`, `color-${config.color}`);
  }

  getAvailableColors(): { id: ThemeColor; name: string; preview: string }[] {
    return [
      { id: 'default', name: 'Purple', preview: '#667eea' },
      { id: 'skyblue', name: 'Sky Blue', preview: '#0ea5e9' },
      { id: 'green', name: 'Green', preview: '#22c55e' }
    ];
  }
}
