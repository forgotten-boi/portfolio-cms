import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SettingsService, AppSettings } from '../../services/settings.service';
import { ThemeService, ThemeColor } from '../../services/theme.service';
import { TranslationService, Language } from '../../services/translation.service';
import { TranslatePipe } from '../../pipes/translate.pipe';

@Component({
  selector: 'app-settings',
  imports: [CommonModule, FormsModule, TranslatePipe],
  templateUrl: './settings.component.html',
  styleUrl: './settings.component.scss'
})
export class SettingsComponent implements OnInit {
  settings!: AppSettings;
  saved = false;
  isDark = false;
  currentColor: ThemeColor = 'default';
  currentLang: Language = 'en';

  constructor(
    private settingsService: SettingsService,
    public themeService: ThemeService,
    public translationService: TranslationService
  ) {}

  ngOnInit(): void {
    this.settings = { ...this.settingsService.settings };
    this.isDark = this.themeService.mode === 'dark';
    this.currentColor = this.themeService.color;
    this.currentLang = this.translationService.currentLang;
  }

  onSave(): void {
    this.settingsService.saveSettings(this.settings);
    this.saved = true;
    setTimeout(() => this.saved = false, 3000);
  }

  toggleDarkMode(): void {
    this.isDark = !this.isDark;
    this.themeService.setTheme({ mode: this.isDark ? 'dark' : 'light' });
  }

  setColor(color: ThemeColor): void {
    this.currentColor = color;
    this.themeService.setColor(color);
  }

  setLanguage(lang: Language): void {
    this.currentLang = lang;
    this.translationService.setLanguage(lang);
  }
}
