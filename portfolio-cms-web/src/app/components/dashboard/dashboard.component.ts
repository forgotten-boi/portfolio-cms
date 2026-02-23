import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { BlogService } from '../../services/blog.service';
import { PortfolioService } from '../../services/portfolio.service';
import { UserService } from '../../services/user.service';
import { TranslatePipe } from '../../pipes/translate.pipe';

interface KanbanCard {
  title: string;
  tags: string[];
  seoScore?: number;
}

interface KanbanColumn {
  id: string;
  name: string;
  items: KanbanCard[];
}

@Component({
  selector: 'app-dashboard',
  imports: [CommonModule, RouterModule, TranslatePipe],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss'
})
export class DashboardComponent implements OnInit {
  stats = {
    totalBlogs: 0,
    publishedBlogs: 0,
    totalPortfolios: 0,
    totalUsers: 0
  };
  loading = true;
  error = '';

  // Snapshot card data
  cvName = 'My Portfolio CV';
  lastCvUpdate = '3 days ago';
  skillCount = 0;
  lastJobTitle = 'Senior Engineer';
  matchScore = 82;
  gapCount = 2;
  resumeCount = 0;
  lastResumeDate = 'N/A';

  // CV sections
  cvSections = [
    { icon: '📝', name: 'Summary', active: true },
    { icon: '⚡', name: 'Skills', active: false },
    { icon: '💼', name: 'Experience', active: false },
    { icon: '🔧', name: 'Projects', active: false },
    { icon: '🎓', name: 'Education', active: false }
  ];

  // Kanban columns
  kanbanColumns: KanbanColumn[] = [
    { id: 'ideas', name: 'Ideas', items: [] },
    { id: 'draft', name: 'Draft', items: [] },
    { id: 'review', name: 'In Review', items: [] },
    { id: 'published', name: 'Published', items: [] }
  ];

  get matchDashArray(): string {
    const circumference = 2 * Math.PI * 52;
    const filled = (this.matchScore / 100) * circumference;
    return `${filled} ${circumference - filled}`;
  }

  constructor(
    private blogService: BlogService,
    private portfolioService: PortfolioService,
    private userService: UserService
  ) {}

  ngOnInit(): void {
    this.loadStats();
  }

  loadStats(): void {
    this.loading = true;
    
    this.blogService.getAll(false).subscribe({
      next: (blogs) => {
        this.stats.totalBlogs = blogs.length;
        this.stats.publishedBlogs = blogs.filter(b => b.isPublished).length;
        
        // Populate kanban board
        this.kanbanColumns[0].items = []; // Ideas
        const drafts = blogs.filter(b => !b.isPublished);
        const published = blogs.filter(b => b.isPublished);
        
        this.kanbanColumns[1].items = drafts.map(b => ({
          title: b.title,
          tags: b.tags?.slice(0, 2) || [],
          seoScore: 75 + Math.floor(Math.random() * 20)
        }));
        this.kanbanColumns[3].items = published.map(b => ({
          title: b.title,
          tags: b.tags?.slice(0, 2) || [],
          seoScore: 80 + Math.floor(Math.random() * 15)
        }));
      },
      error: (err) => {
        console.error('Error loading blogs:', err);
        this.error = 'Failed to load some statistics';
      }
    });

    this.portfolioService.getAll().subscribe({
      next: (portfolios) => {
        this.stats.totalPortfolios = portfolios.length;
        this.resumeCount = portfolios.length;
        if (portfolios.length > 0) {
          const p = portfolios[0];
          this.cvName = p.title || 'My Portfolio CV';
          this.skillCount = p.data?.skills?.length || 0;
          this.lastCvUpdate = this.timeAgo(p.updatedAt || p.createdAt);
          this.lastResumeDate = this.timeAgo(p.updatedAt || p.createdAt);
        }
      },
      error: (err) => {
        console.error('Error loading portfolios:', err);
      }
    });

    this.userService.getAll().subscribe({
      next: (users) => {
        this.stats.totalUsers = users.length;
        this.loading = false;
      },
      error: (err) => {
        console.error('Error loading users:', err);
        this.loading = false;
      }
    });
  }

  private timeAgo(date: Date | string | undefined): string {
    if (!date) return 'N/A';
    const now = new Date();
    const d = new Date(date);
    const diffMs = now.getTime() - d.getTime();
    const diffDays = Math.floor(diffMs / 86400000);
    if (diffDays === 0) return 'today';
    if (diffDays === 1) return '1 day ago';
    if (diffDays < 7) return `${diffDays} days ago`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
    return `${Math.floor(diffDays / 30)} months ago`;
  }
}
