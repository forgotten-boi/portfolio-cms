import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { ThemeService, ThemeColor } from '../../services/theme.service';
import { TranslationService, Language } from '../../services/translation.service';
import { TranslatePipe } from '../../pipes/translate.pipe';

@Component({
  selector: 'app-topbar',
  imports: [CommonModule, RouterModule, TranslatePipe],
  templateUrl: './topbar.component.html',
  styleUrl: './topbar.component.scss'
})
export class TopbarComponent implements OnInit {
  isAuthenticated = false;
  isDark = false;
  showLangMenu = false;
  showColorMenu = false;
  showProfileMenu = false;
  userName = 'Admin';

  constructor(
    private authService: AuthService,
    private router: Router,
    public themeService: ThemeService,
    public translationService: TranslationService
  ) {}

  ngOnInit(): void {
    this.authService.isAuthenticated$.subscribe(isAuth => {
      this.isAuthenticated = isAuth;
    });
    this.themeService.theme$.subscribe(t => {
      this.isDark = t.mode === 'dark';
    });
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }

  toggleDarkMode(): void {
    this.themeService.toggleMode();
  }

  setColor(color: ThemeColor): void {
    this.themeService.setColor(color);
    this.showColorMenu = false;
  }

  setLanguage(lang: Language): void {
    this.translationService.setLanguage(lang);
    this.showLangMenu = false;
  }

  toggleLangMenu(): void {
    this.showLangMenu = !this.showLangMenu;
    this.showColorMenu = false;
    this.showProfileMenu = false;
  }

  toggleColorMenu(): void {
    this.showColorMenu = !this.showColorMenu;
    this.showLangMenu = false;
    this.showProfileMenu = false;
  }

  toggleProfileMenu(): void {
    this.showProfileMenu = !this.showProfileMenu;
    this.showLangMenu = false;
    this.showColorMenu = false;
  }

  getCurrentLanguageName(): string {
    const lang = this.translationService.getAvailableLanguages().find(
      l => l.code === this.translationService.currentLang
    );
    return lang?.nativeName || 'English';
  }

  getCurrentColorPreview(): string {
    const color = this.themeService.getAvailableColors().find(
      c => c.id === this.themeService.color
    );
    return color?.preview || '#667eea';
  }
}
