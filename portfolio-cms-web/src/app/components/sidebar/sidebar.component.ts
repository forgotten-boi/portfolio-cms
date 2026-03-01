import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { TranslatePipe } from '../../pipes/translate.pipe';

@Component({
  selector: 'app-sidebar',
  imports: [CommonModule, RouterModule, TranslatePipe],
  templateUrl: './sidebar.component.html',
  styleUrl: './sidebar.component.scss'
})
export class SidebarComponent implements OnInit {
  isAuthenticated = false;
  collapsed = false;

  navItems = [
    { icon: '🏠', labelKey: 'nav.dashboard', route: '/dashboard', exact: true },
    { icon: '✍️', labelKey: 'nav.blogs', route: '/dashboard/blogs', exact: false },
    { icon: '📄', labelKey: 'nav.cvManager', route: '/dashboard/cv-manager', exact: false },
    { icon: '🎯', labelKey: 'nav.jobMatcher', route: '/dashboard/job-matcher', exact: false },
    { icon: '📑', labelKey: 'nav.resumeGen', route: '/dashboard/resume-generator', exact: false },
    { icon: '📊', labelKey: 'nav.analytics', route: '/dashboard/analytics', exact: false },
    { icon: '🌐', labelKey: 'nav.portfolioMgr', route: '/dashboard/portfolio-manager', exact: false },
    { icon: '💳', labelKey: 'nav.payments', route: '/dashboard/payments', exact: false },
    { icon: '📡', labelKey: 'nav.eventAnalytics', route: '/dashboard/event-analytics', exact: false },
    { icon: '⚙️', labelKey: 'nav.settings', route: '/dashboard/settings', exact: false }
  ];

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.authService.isAuthenticated$.subscribe(
      isAuth => this.isAuthenticated = isAuth
    );
  }

  toggleCollapse(): void {
    this.collapsed = !this.collapsed;
  }
}
