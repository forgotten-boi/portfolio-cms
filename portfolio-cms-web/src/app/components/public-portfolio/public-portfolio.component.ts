import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { PortfolioService } from '../../services/portfolio.service';

@Component({
  selector: 'app-public-portfolio',
  imports: [CommonModule],
  templateUrl: './public-portfolio.component.html',
  styleUrl: './public-portfolio.component.scss'
})
export class PublicPortfolioComponent implements OnInit {
  portfolio: any = null;
  loading = true;
  error: string | null = null;
  renderedHtml: SafeHtml | null = null;
  hasTemplate = false;
  linkCopied = false;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private portfolioService: PortfolioService,
    private sanitizer: DomSanitizer
  ) {}

  ngOnInit(): void {
    const slug = this.route.snapshot.paramMap.get('slug');
    if (!slug) {
      this.error = 'Portfolio not found';
      this.loading = false;
      return;
    }

    this.portfolioService.getBySlug(slug).subscribe({
      next: (portfolio) => {
        if (!portfolio || !portfolio.isPublished) {
          this.error = 'Portfolio not found or not published';
          this.loading = false;
          return;
        }

        this.portfolio = portfolio;
        if (portfolio.templateHtml) {
          this.hasTemplate = true;
          this.renderTemplate();
        }
        this.loading = false;
      },
      error: (err) => {
        console.error('Error loading portfolio:', err);
        this.error = 'Portfolio not found';
        this.loading = false;
      }
    });
  }

  private renderTemplate(): void {
    if (!this.portfolio || !this.portfolio.templateHtml) {
      return;
    }

    let html = this.portfolio.templateHtml;

    const replacements: Record<string, any> = {
      'FULL_NAME': this.portfolio.fullName || '',
      'TITLE': this.portfolio.title || '',
      'BIO': this.portfolio.bio || '',
      'PROFILE_IMAGE': this.portfolio.profileImage || 'https://via.placeholder.com/200',
      'EMAIL': this.portfolio.email || '',
      'PHONE': this.portfolio.phone || '',
      'LOCATION': this.portfolio.location || '',
      'LINKEDIN': this.portfolio.linkedIn || '#',
      'GITHUB': this.portfolio.github || '#',
      'TWITTER': this.portfolio.twitter || '#',
      'WEBSITE': this.portfolio.website || '#'
    };

    Object.keys(replacements).forEach(key => {
      const regex = new RegExp(`{{${key}}}`, 'g');
      html = html.replace(regex, replacements[key]);
    });

    if (this.portfolio.workExperience && Array.isArray(this.portfolio.workExperience)) {
      const experienceHtml = this.portfolio.workExperience.map((exp: any) => `
        <div class="experience-item">
          <h3>${exp.title || ''}</h3>
          <h4>${exp.company || ''}</h4>
          <p class="period">${exp.startDate || ''} - ${exp.endDate || 'Present'}</p>
          <p>${exp.description || ''}</p>
        </div>
      `).join('');
      html = html.replace(/{{#each WORK_EXPERIENCE}}.*?{{\/each}}/gs, experienceHtml);
    }

    if (this.portfolio.education && Array.isArray(this.portfolio.education)) {
      const educationHtml = this.portfolio.education.map((edu: any) => `
        <div class="education-item">
          <h3>${edu.degree || ''}</h3>
          <h4>${edu.institution || ''}</h4>
          <p class="period">${edu.year || ''}</p>
          <p>${edu.description || ''}</p>
        </div>
      `).join('');
      html = html.replace(/{{#each EDUCATION}}.*?{{\/each}}/gs, educationHtml);
    }

    if (this.portfolio.skills && Array.isArray(this.portfolio.skills)) {
      const skillsHtml = this.portfolio.skills.map((skill: any) => `
        <span class="skill-tag">${skill.name || skill}</span>
      `).join('');
      html = html.replace(/{{#each SKILLS}}.*?{{\/each}}/gs, skillsHtml);
    }

    if (this.portfolio.projects && Array.isArray(this.portfolio.projects)) {
      const projectsHtml = this.portfolio.projects.map((project: any) => `
        <div class="project-item">
          <h3>${project.name || ''}</h3>
          <p>${project.description || ''}</p>
          ${project.url ? `<a href="${project.url}" target="_blank">View Project</a>` : ''}
        </div>
      `).join('');
      html = html.replace(/{{#each PROJECTS}}.*?{{\/each}}/gs, projectsHtml);
    }

    this.renderedHtml = this.sanitizer.bypassSecurityTrustHtml(html);
  }

  get currentUrl(): string {
    return window.location.href;
  }

  get workExperiences(): any[] {
    return this.portfolio?.data?.workExperiences || this.portfolio?.workExperience || [];
  }

  get educationList(): any[] {
    return this.portfolio?.data?.education || this.portfolio?.education || [];
  }

  get skillsList(): any[] {
    return this.portfolio?.data?.skills || this.portfolio?.skills || [];
  }

  get projectsList(): any[] {
    return this.portfolio?.data?.projects || this.portfolio?.projects || [];
  }

  get certificationsList(): any[] {
    return this.portfolio?.data?.certifications || [];
  }

  shareOnLinkedIn(): void {
    const url = encodeURIComponent(this.currentUrl);
    window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${url}`, '_blank');
  }

  shareOnFacebook(): void {
    const url = encodeURIComponent(this.currentUrl);
    window.open(`https://www.facebook.com/sharer/sharer.php?u=${url}`, '_blank');
  }

  copyLink(): void {
    navigator.clipboard.writeText(this.currentUrl).then(() => {
      this.linkCopied = true;
      setTimeout(() => this.linkCopied = false, 2000);
    });
  }
}
