import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { BlogService } from '../../services/blog.service';
import { PortfolioService } from '../../services/portfolio.service';
import { TranslatePipe } from '../../pipes/translate.pipe';

interface StatCard {
  icon: string;
  label: string;
  value: number | string;
  change: string;
  positive: boolean;
}

interface ChartBar {
  label: string;
  value: number;
  max: number;
}

@Component({
  selector: 'app-analytics',
  imports: [CommonModule, FormsModule, RouterModule, TranslatePipe],
  templateUrl: './analytics.component.html',
  styleUrl: './analytics.component.scss'
})
export class AnalyticsComponent implements OnInit {
  loading = true;
  period = '30d';

  stats: StatCard[] = [];
  blogViews: ChartBar[] = [];
  topSkills: ChartBar[] = [];
  matchTrend: { month: string; score: number }[] = [];
  recentActivity: { icon: string; text: string; time: string }[] = [];

  constructor(
    private blogService: BlogService,
    private portfolioService: PortfolioService
  ) {}

  ngOnInit(): void {
    this.loadData();
  }

  loadData(): void {
    this.loading = true;

    this.stats = [
      { icon: '📝', label: 'Total Blog Posts', value: 0, change: '+3 this month', positive: true },
      { icon: '👁️', label: 'Total Views', value: 0, change: '+12%', positive: true },
      { icon: '🎯', label: 'Avg Match Score', value: '82%', change: '+5%', positive: true },
      { icon: '📑', label: 'Resume Downloads', value: 14, change: '+2 this week', positive: true }
    ];

    this.matchTrend = [
      { month: 'Jul', score: 65 },
      { month: 'Aug', score: 70 },
      { month: 'Sep', score: 68 },
      { month: 'Oct', score: 75 },
      { month: 'Nov', score: 78 },
      { month: 'Dec', score: 82 }
    ];

    this.topSkills = [
      { label: 'Angular', value: 92, max: 100 },
      { label: 'TypeScript', value: 88, max: 100 },
      { label: 'Node.js', value: 75, max: 100 },
      { label: 'Docker', value: 60, max: 100 },
      { label: 'GraphQL', value: 40, max: 100 },
      { label: 'CI/CD', value: 35, max: 100 }
    ];

    this.recentActivity = [
      { icon: '✍️', text: 'Published "Angular Signals Guide"', time: '2 hours ago' },
      { icon: '🎯', text: 'New job match: 89% at TechCorp', time: '5 hours ago' },
      { icon: '📑', text: 'Resume downloaded 3 times', time: '1 day ago' },
      { icon: '📄', text: 'Updated CV — Skills section', time: '2 days ago' },
      { icon: '🎯', text: 'New job match: 74% at StartupXYZ', time: '3 days ago' }
    ];

    // Load real data
    this.blogService.getAll().subscribe({
      next: (blogs) => {
        this.stats[0].value = blogs.length;
        const totalViews = blogs.reduce((sum, b) => sum + (b.views || 0), 0);
        this.stats[1].value = totalViews;

        // Build blog views chart from real data
        this.blogViews = blogs.slice(0, 6).map(b => ({
          label: b.title.length > 15 ? b.title.substring(0, 15) + '…' : b.title,
          value: b.views || 0,
          max: Math.max(...blogs.map(bl => bl.views || 1))
        }));

        this.loading = false;
      },
      error: () => {
        this.loading = false;
      }
    });
  }

  setPeriod(p: string): void {
    this.period = p;
    this.loadData();
  }

  getBarWidth(value: number, max: number): number {
    return max > 0 ? (value / max) * 100 : 0;
  }

  getTrendHeight(score: number): number {
    return ((score - 50) / 50) * 100;
  }
}
