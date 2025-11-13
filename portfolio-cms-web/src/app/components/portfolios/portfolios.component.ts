import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { PortfolioService } from '../../services/portfolio.service';
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

  constructor(
    private portfolioService: PortfolioService,
    private router: Router
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
    this.router.navigate(['/dashboard/portfolios/new']);
  }

  editPortfolio(id: string): void {
    this.router.navigate(['/dashboard/portfolios/edit', id]);
  }

  deletePortfolio(id: string, title: string): void {
    if (confirm(`Are you sure you want to delete "${title}"?`)) {
      this.portfolioService.delete(id).subscribe({
        next: () => {
          this.portfolios = this.portfolios.filter(p => p.id !== id);
        },
        error: (err) => {
          alert('Failed to delete portfolio');
          console.error('Error deleting portfolio:', err);
        }
      });
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
