import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { PortfolioService } from '../../services/portfolio.service';
import { NotificationService } from '../../services/notification.service';
import { Portfolio } from '../../models';

@Component({
  selector: 'app-portfolios',
  imports: [CommonModule],
  templateUrl: './portfolios.component.html',
  styleUrl: './portfolios.component.scss'
})
export class PortfoliosComponent implements OnInit {
  portfolios: Portfolio[] = [];
  loading = true;
  error: string | null = null;
  confirmDeleteId: string | null = null;

  constructor(
    private portfolioService: PortfolioService,
    private router: Router,
    private notificationService: NotificationService
  ) {}

  ngOnInit(): void {
    this.loadPortfolios();
  }

  loadPortfolios(): void {
    this.loading = true;
    this.error = null;
    
    this.portfolioService.getAll().subscribe({
      next: (portfolios) => {
        this.portfolios = portfolios;
        this.loading = false;
      },
      error: (err) => {
        this.error = 'Failed to load portfolios';
        this.loading = false;
        console.error('Error loading portfolios:', err);
      }
    });
  }

  createPortfolio(): void {
    this.router.navigate(['/portfolios/new']);
  }

  editPortfolio(id: string): void {
    this.router.navigate(['/portfolios/edit', id]);
  }

  deletePortfolio(id: string): void {
    this.confirmDeleteId = id;
  }

  confirmDelete(): void {
    if (!this.confirmDeleteId) return;
    const id = this.confirmDeleteId;
    this.confirmDeleteId = null;
    this.portfolioService.delete(id).subscribe({
      next: () => {
        this.portfolios = this.portfolios.filter(p => p.id !== id);
        this.notificationService.success('Portfolio deleted successfully');
      },
      error: (err) => {
        this.notificationService.error('Failed to delete portfolio');
        console.error('Error deleting portfolio:', err);
      }
    });
  }

  cancelDelete(): void {
    this.confirmDeleteId = null;
  }

  toggleVisibility(portfolio: Portfolio): void {
    const updatedData: { isPublished: boolean } = {
      isPublished: !portfolio.isPublished
    };
    this.portfolioService.update(portfolio.id, updatedData).subscribe({
      next: (updated) => {
        const index = this.portfolios.findIndex(p => p.id === portfolio.id);
        if (index !== -1) {
          this.portfolios[index] = updated;
        }
        this.notificationService.success(
          updated.isPublished ? 'Portfolio is now public' : 'Portfolio is now private'
        );
      },
      error: (err) => {
        this.notificationService.error('Failed to update portfolio visibility');
        console.error('Error toggling visibility:', err);
      }
    });
  }

  copyPublicLink(portfolio: Portfolio): void {
    if (!portfolio.slug) {
      this.notificationService.warning('No public link available for this portfolio');
      return;
    }
    const url = `${window.location.origin}/portfolio/${portfolio.slug}`;
    navigator.clipboard.writeText(url).then(() => {
      this.notificationService.success('Public link copied to clipboard!');
    }).catch(() => {
      this.notificationService.info(`Public link: ${url}`);
    });
  }

  viewPublicPortfolio(portfolio: Portfolio): void {
    if (portfolio.slug) {
      window.open(`/portfolio/${portfolio.slug}`, '_blank');
    }
  }

  getVisibilityClass(isPublic: boolean): string {
    return isPublic ? 'visibility-public' : 'visibility-private';
  }

  getVisibilityText(isPublic: boolean): string {
    return isPublic ? 'Public' : 'Private';
  }

  getTotalItems(portfolio: Portfolio): number {
    const data = portfolio.data;
    return (data.workExperiences?.length || 0) +
           (data.education?.length || 0) +
           (data.skills?.length || 0) +
           (data.projects?.length || 0) +
           (data.certifications?.length || 0);
  }
}

