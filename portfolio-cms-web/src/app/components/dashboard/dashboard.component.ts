import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { BlogService } from '../../services/blog.service';
import { PortfolioService } from '../../services/portfolio.service';
import { UserService } from '../../services/user.service';

@Component({
  selector: 'app-dashboard',
  imports: [CommonModule, RouterModule],
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
      },
      error: (err) => {
        console.error('Error loading blogs:', err);
        this.error = 'Failed to load some statistics';
      }
    });

    this.portfolioService.getAll().subscribe({
      next: (portfolios) => {
        this.stats.totalPortfolios = portfolios.length;
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
}
