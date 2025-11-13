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
        this.renderTemplate();
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
      this.error = 'Template not found';
      return;
    }

    let html = this.portfolio.templateHtml;

    // Replace variables in template
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

    // Replace simple variables
    Object.keys(replacements).forEach(key => {
      const regex = new RegExp(`{{${key}}}`, 'g');
      html = html.replace(regex, replacements[key]);
    });

    // Handle work experience array
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

    // Handle education array
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

    // Handle skills array
    if (this.portfolio.skills && Array.isArray(this.portfolio.skills)) {
      const skillsHtml = this.portfolio.skills.map((skill: any) => `
        <span class="skill-tag">${skill.name || skill}</span>
      `).join('');
      html = html.replace(/{{#each SKILLS}}.*?{{\/each}}/gs, skillsHtml);
    }

    // Handle projects array
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
}
