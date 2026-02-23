import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { PortfolioService } from '../../services/portfolio.service';
import { NotificationService } from '../../services/notification.service';
import { CreatePortfolioDto, GeneratePortfolioDto } from '../../models';
import { TranslatePipe } from '../../pipes/translate.pipe';

@Component({
  selector: 'app-portfolio-form',
  imports: [CommonModule, ReactiveFormsModule, FormsModule, TranslatePipe],
  templateUrl: './portfolio-form.component.html',
  styleUrl: './portfolio-form.component.scss'
})
export class PortfolioFormComponent implements OnInit {
  portfolioForm!: FormGroup;
  isEditMode = false;
  portfolioId?: string;
  loading = false;
  generating = false;
  error: string | null = null;
  showGenerateModal = false;
  selectedFile: File | null = null;
  linkedInUrl = '';

  templates = [
    { id: 'Modern', name: 'Modern', description: 'Purple gradient with modern cards' },
    { id: 'Classic', name: 'Classic', description: 'Professional serif typography' },
    { id: 'Minimal', name: 'Minimal', description: 'Clean black and white design' },
    { id: 'Creative', name: 'Creative', description: 'Terminal/hacker theme' },
    { id: 'Vibrant', name: 'Vibrant', description: 'Pink gradient with emoji icons' }
  ];

  constructor(
    private fb: FormBuilder,
    private portfolioService: PortfolioService,
    private route: ActivatedRoute,
    private router: Router,
    private notificationService: NotificationService
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
      isPublished: [false],
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
          isPublished: portfolio.isPublished,
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
        this.notificationService.success(
          this.isEditMode ? 'Portfolio updated successfully' : 'Portfolio created successfully'
        );
        this.router.navigate(['/portfolios']);
      },
      error: (err) => {
        this.error = this.isEditMode ? 'Failed to update portfolio' : 'Failed to create portfolio';
        this.loading = false;
        console.error('Error saving portfolio:', err);
      }
    });
  }

  openGenerateModal(): void {
    this.showGenerateModal = true;
    this.error = null;
  }

  closeGenerateModal(): void {
    this.showGenerateModal = false;
    this.selectedFile = null;
    this.linkedInUrl = '';
    this.error = null;
  }

  onFileSelected(event: any): void {
    const file = event.target.files[0];
    if (file && file.type === 'application/pdf') {
      this.selectedFile = file;
      this.error = null;
    } else {
      this.error = 'Please select a PDF file';
      this.selectedFile = null;
    }
  }

  async generatePortfolio(): Promise<void> {
    if (!this.selectedFile && !this.linkedInUrl) {
      this.error = 'Please provide either a PDF resume or LinkedIn URL';
      return;
    }

    this.generating = true;
    this.error = null;

    try {
      const generateData: GeneratePortfolioDto = {
        templateId: this.portfolioForm.get('template')?.value || 'Modern'
      };

      if (this.selectedFile) {
        // Convert PDF to base64
        const base64 = await this.fileToBase64(this.selectedFile);
        generateData.pdfBase64 = base64;
      }

      if (this.linkedInUrl) {
        generateData.linkedInProfileUrl = this.linkedInUrl;
      }

      this.portfolioService.generate(generateData).subscribe({
        next: (portfolio) => {
          this.generating = false;
          this.closeGenerateModal();
          
          // Pre-fill form with generated data
          this.portfolioForm.patchValue({
            title: portfolio.title,
            subtitle: portfolio.subtitle,
            bio: portfolio.bio,
            template: portfolio.template || 'Modern',
            isPublished: portfolio.isPublished || false,
            featuredBlogsEnabled: portfolio.featuredBlogsEnabled || false
          });

          // Show success message
          this.notificationService.success('Portfolio generated successfully! Review and save your portfolio.');
        },
        error: (err) => {
          this.generating = false;
          this.error = err.error?.detail || 'Failed to generate portfolio';
          console.error('Generate error:', err);
        }
      });
    } catch (err) {
      this.generating = false;
      this.error = 'Failed to process file';
      console.error('File processing error:', err);
    }
  }

  private fileToBase64(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        const result = reader.result as string;
        // Remove the data URL prefix (e.g., "data:application/pdf;base64,")
        const base64 = result.split(',')[1];
        resolve(base64);
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  }

  cancel(): void {
    this.router.navigate(['/portfolios']);
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
