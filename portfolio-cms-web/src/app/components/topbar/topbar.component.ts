import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { ThemeService, ThemeColor } from '../../services/theme.service';
import { TranslationService, Language } from '../../services/translation.service';
import { ActivityNotificationService } from '../../services/activity-notification.service';
import { ActivityNotification } from '../../models';
import { TranslatePipe } from '../../pipes/translate.pipe';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-topbar',
  imports: [CommonModule, RouterModule, TranslatePipe],
  templateUrl: './topbar.component.html',
  styleUrl: './topbar.component.scss'
})
export class TopbarComponent implements OnInit, OnDestroy {
  isAuthenticated = false;
  isDark = false;
  showLangMenu = false;
  showColorMenu = false;
  showProfileMenu = false;
  showNotifMenu = false;
  userName = 'Admin';

  notifications: ActivityNotification[] = [];
  unreadCount = 0;
  private subs: Subscription[] = [];

  constructor(
    private authService: AuthService,
    private router: Router,
    public themeService: ThemeService,
    public translationService: TranslationService,
    public activityNotificationService: ActivityNotificationService
  ) {}

  ngOnInit(): void {
    this.subs.push(
      this.authService.isAuthenticated$.subscribe(isAuth => {
        this.isAuthenticated = isAuth;
      }),
      this.themeService.theme$.subscribe(t => {
        this.isDark = t.mode === 'dark';
      }),
      this.activityNotificationService.notifications$.subscribe(notifs => {
        this.notifications = notifs;
        this.unreadCount = this.activityNotificationService.unreadCount;
      })
    );
  }

  ngOnDestroy(): void {
    this.subs.forEach(s => s.unsubscribe());
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
    this.showNotifMenu = false;
  }

  toggleColorMenu(): void {
    this.showColorMenu = !this.showColorMenu;
    this.showLangMenu = false;
    this.showProfileMenu = false;
    this.showNotifMenu = false;
  }

  toggleProfileMenu(): void {
    this.showProfileMenu = !this.showProfileMenu;
    this.showLangMenu = false;
    this.showColorMenu = false;
    this.showNotifMenu = false;
  }

  toggleNotifMenu(): void {
    this.showNotifMenu = !this.showNotifMenu;
    this.showLangMenu = false;
    this.showColorMenu = false;
    this.showProfileMenu = false;
    if (this.showNotifMenu) {
      this.activityNotificationService.markAllRead();
    }
  }

  clearNotifications(): void {
    this.activityNotificationService.clear();
  }

  formatTimeAgo(date: Date | string): string {
    const now = new Date();
    const d = new Date(date);
    const diffMs = now.getTime() - d.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    if (diffMins < 1) return 'just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours}h ago`;
    const diffDays = Math.floor(diffHours / 24);
    if (diffDays < 7) return `${diffDays}d ago`;
    return d.toLocaleDateString();
  }

  getNotifIcon(type: string): string {
    switch (type) {
      case 'blog_published': return '✍️';
      case 'blog_unpublished': return '📝';
      case 'portfolio_published': return '🌐';
      case 'portfolio_unpublished': return '📁';
      default: return 'ℹ️';
    }
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
