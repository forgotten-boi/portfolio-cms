import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { PortfolioService } from '../../services/portfolio.service';
import { CreatePortfolioDto } from '../../models';

@Component({
  selector: 'app-portfolio-form',
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './portfolio-form.component.html',
  styleUrl: './portfolio-form.component.scss'
})
export class PortfolioFormComponent implements OnInit {
  portfolioForm!: FormGroup;
  isEditMode = false;
  portfolioId?: string;
  loading = false;
  error: string | null = null;

  templates = ['Modern', 'Classic', 'Minimalist', 'Creative'];

  constructor(
    private fb: FormBuilder,
    private portfolioService: PortfolioService,
    private route: ActivatedRoute,
    private router: Router
  ) {
    this.initForm();
  }

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.isEditMode = true;
      this.portfolioId = id;
      this.loadPortfolio(this.portfolioId);
    }
  }

  initForm(): void {
    this.portfolioForm = this.fb.group({
      title: ['', [Validators.required, Validators.maxLength(100)]],
      subtitle: ['', [Validators.required, Validators.maxLength(200)]],
      bio: ['', [Validators.required, Validators.maxLength(1000)]],
      template: ['Modern', [Validators.required]],
      isPublic: [false],
      featuredBlogsEnabled: [false]
    });
  }

  loadPortfolio(id: string): void {
    this.loading = true;
    this.portfolioService.getById(id).subscribe({
      next: (portfolio) => {
        this.portfolioForm.patchValue({
          title: portfolio.title,
          subtitle: portfolio.subtitle,
          bio: portfolio.bio,
          template: portfolio.template,
          isPublic: portfolio.isPublic,
          featuredBlogsEnabled: portfolio.featuredBlogsEnabled
        });
        this.loading = false;
      },
      error: (err) => {
        this.error = 'Failed to load portfolio';
        this.loading = false;
        console.error('Error loading portfolio:', err);
      }
    });
  }

  onSubmit(): void {
    if (this.portfolioForm.invalid) {
      Object.keys(this.portfolioForm.controls).forEach(key => {
        this.portfolioForm.controls[key].markAsTouched();
      });
      return;
    }

    this.loading = true;
    this.error = null;

    const portfolioData: CreatePortfolioDto = {
      ...this.portfolioForm.value
    };

    const request$ = this.isEditMode
      ? this.portfolioService.update(this.portfolioId!, portfolioData)
      : this.portfolioService.create(portfolioData);

    request$.subscribe({
      next: () => {
        this.router.navigate(['/dashboard/portfolios']);
      },
      error: (err) => {
        this.error = this.isEditMode ? 'Failed to update portfolio' : 'Failed to create portfolio';
        this.loading = false;
        console.error('Error saving portfolio:', err);
      }
    });
  }

  cancel(): void {
    this.router.navigate(['/dashboard/portfolios']);
  }

  isFieldInvalid(fieldName: string): boolean {
    const field = this.portfolioForm.get(fieldName);
    return !!(field && field.invalid && field.touched);
  }

  getErrorMessage(fieldName: string): string {
    const field = this.portfolioForm.get(fieldName);
    if (field?.hasError('required')) {
      return `${fieldName.charAt(0).toUpperCase() + fieldName.slice(1)} is required`;
    }
    if (field?.hasError('maxlength')) {
      const maxLength = field.errors?.['maxlength'].requiredLength;
      return `${fieldName.charAt(0).toUpperCase() + fieldName.slice(1)} must be at most ${maxLength} characters`;
    }
    return '';
  }
}
