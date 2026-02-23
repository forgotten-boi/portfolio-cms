import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { PortfolioService } from '../../services/portfolio.service';
import { Portfolio, PortfolioData, WorkExperience, Education, Skill, Project, Certification } from '../../models';
import { TranslatePipe } from '../../pipes/translate.pipe';
import { TranslationService } from '../../services/translation.service';

interface PortfolioSection {
  key: string;
  nameKey: string;
  icon: string;
  enabled: boolean;
}

@Component({
  selector: 'app-portfolio-manager',
  imports: [CommonModule, FormsModule, TranslatePipe],
  templateUrl: './portfolio-manager.component.html',
  styleUrl: './portfolio-manager.component.scss'
})
export class PortfolioManagerComponent implements OnInit {
  // ── View Mode ──
  viewMode: 'list' | 'edit' = 'list';
  portfolios: Portfolio[] = [];

  portfolio: Portfolio | null = null;
  loading = true;
  saving = false;
  error: string | null = null;
  successMsg: string | null = null;
  activeSection = 'about';
  editingSection: string | null = null;
  linkCopied = false;

  // Portfolio basic info
  title = '';
  subtitle = '';
  bio = '';
  template = 'Modern';
  isPublished = false;

  // Portfolio data sections
  data: PortfolioData = {
    workExperiences: [],
    education: [],
    skills: [],
    projects: [],
    certifications: []
  };

  // New item forms
  newExperience: Partial<WorkExperience> = {};
  newEducation: Partial<Education> = {};
  newSkill: Partial<Skill> = { level: 70 };
  newProject: Partial<Project> = { technologies: [] };
  newCertification: Partial<Certification> = {};
  newTech = '';

  sections: PortfolioSection[] = [
    { key: 'about', nameKey: 'pm.about', icon: '👤', enabled: true },
    { key: 'experience', nameKey: 'pm.experience', icon: '💼', enabled: true },
    { key: 'education', nameKey: 'pm.education', icon: '🎓', enabled: true },
    { key: 'skills', nameKey: 'pm.skills', icon: '⚡', enabled: true },
    { key: 'projects', nameKey: 'pm.projects', icon: '🔧', enabled: true },
    { key: 'certifications', nameKey: 'pm.certifications', icon: '🏅', enabled: true }
  ];

  templates = [
    { id: 'Modern', label: 'Modern' },
    { id: 'Classic', label: 'Classic' },
    { id: 'Minimal', label: 'Minimal' },
    { id: 'Creative', label: 'Creative' },
    { id: 'Vibrant', label: 'Vibrant' }
  ];

  constructor(
    private portfolioService: PortfolioService,
    private router: Router,
    private translationService: TranslationService
  ) {}

  ngOnInit(): void {
    this.loadPortfolios();
  }

  // ── List View Methods ──
  loadPortfolios(): void {
    this.loading = true;
    this.error = null;
    this.portfolioService.getAll().subscribe({
      next: (portfolios: Portfolio[]) => {
        this.portfolios = portfolios;
        this.loading = false;
      },
      error: () => {
        this.error = 'Failed to load portfolios';
        this.loading = false;
      }
    });
  }

  editPortfolio(portfolio: Portfolio): void {
    this.portfolio = portfolio;
    this.populateFromPortfolio(portfolio);
    this.viewMode = 'edit';
    this.activeSection = 'about';
  }

  deletePortfolio(id: string, title: string): void {
    if (confirm(this.translationService.t('pm.confirmDelete'))) {
      this.portfolioService.delete(id).subscribe({
        next: () => {
          this.portfolios = this.portfolios.filter(p => p.id !== id);
          this.showSuccess('Portfolio deleted!');
        },
        error: () => {
          this.showError('Failed to delete portfolio');
        }
      });
    }
  }

  backToList(): void {
    this.viewMode = 'list';
    this.portfolio = null;
    this.resetForm();
    this.loadPortfolios();
  }

  createNewPortfolio(): void {
    this.portfolio = null;
    this.resetForm();
    this.title = 'My Portfolio';
    this.subtitle = 'Full Stack Developer';
    this.bio = '';
    this.template = 'Modern';
    this.isPublished = false;
    this.viewMode = 'edit';
  }

  getStatusClass(isPublished: boolean): string {
    return isPublished ? 'status-published' : 'status-draft';
  }

  getStatusText(isPublished: boolean): string {
    return isPublished ? this.translationService.t('pm.published') : this.translationService.t('pm.draft');
  }

  getPortfolioItemCount(p: Portfolio): number {
    if (!p.data) return 0;
    return (p.data.workExperiences?.length || 0) +
           (p.data.education?.length || 0) +
           (p.data.skills?.length || 0) +
           (p.data.projects?.length || 0) +
           (p.data.certifications?.length || 0);
  }

  getPortfolioPublicUrl(p: Portfolio): string {
    if (!p.slug) return '';
    return `${window.location.origin}/portfolio/${p.slug}`;
  }

  copyPortfolioLink(slug: string): void {
    const url = `${window.location.origin}/portfolio/${slug}`;
    navigator.clipboard.writeText(url).then(() => {
      this.showSuccess('Link copied to clipboard!');
    });
  }

  private resetForm(): void {
    this.title = '';
    this.subtitle = '';
    this.bio = '';
    this.template = 'Modern';
    this.isPublished = false;
    this.data = { workExperiences: [], education: [], skills: [], projects: [], certifications: [] };
    this.newExperience = {};
    this.newEducation = {};
    this.newSkill = { level: 70 };
    this.newProject = { technologies: [] };
    this.newCertification = {};
    this.newTech = '';
    this.error = null;
    this.successMsg = null;
  }

  // ── Editor Methods ──
  private populateFromPortfolio(p: Portfolio): void {
    this.title = p.title || '';
    this.subtitle = p.subtitle || '';
    this.bio = p.bio || '';
    this.template = p.template || 'Modern';
    this.isPublished = p.isPublished || false;
    if (p.data) {
      this.data = {
        workExperiences: p.data.workExperiences || [],
        education: p.data.education || [],
        skills: p.data.skills || [],
        projects: p.data.projects || [],
        certifications: p.data.certifications || []
      };
    }
  }

  selectSection(key: string): void {
    this.activeSection = key;
    this.editingSection = null;
  }

  get publicUrl(): string {
    if (!this.portfolio?.slug) return '';
    return `${window.location.origin}/portfolio/${this.portfolio.slug}`;
  }

  copyPublicUrl(): void {
    if (this.publicUrl) {
      navigator.clipboard.writeText(this.publicUrl).then(() => {
        this.linkCopied = true;
        this.showSuccess('Link copied!');
        setTimeout(() => this.linkCopied = false, 2000);
      });
    }
  }

  viewPublic(): void {
    if (this.portfolio?.slug) {
      window.open(`/portfolio/${this.portfolio.slug}`, '_blank');
    }
  }

  shareOnLinkedIn(): void {
    const url = encodeURIComponent(this.publicUrl);
    window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${url}`, '_blank');
  }

  shareOnFacebook(): void {
    const url = encodeURIComponent(this.publicUrl);
    window.open(`https://www.facebook.com/sharer/sharer.php?u=${url}`, '_blank');
  }

  togglePublish(): void {
    this.isPublished = !this.isPublished;
    this.save();
  }

  save(): void {
    this.saving = true;
    this.error = null;

    const payload = {
      title: this.title,
      subtitle: this.subtitle,
      bio: this.bio,
      template: this.template,
      isPublished: this.isPublished,
      featuredBlogsEnabled: this.portfolio?.featuredBlogsEnabled || false,
      data: this.data
    };

    const obs = this.portfolio
      ? this.portfolioService.update(this.portfolio.id, payload)
      : this.portfolioService.create(payload);

    obs.subscribe({
      next: (result: Portfolio) => {
        this.portfolio = result;
        this.populateFromPortfolio(result);
        // Update portfolios list
        const idx = this.portfolios.findIndex(p => p.id === result.id);
        if (idx >= 0) {
          this.portfolios[idx] = result;
        } else {
          this.portfolios.push(result);
        }
        this.saving = false;
        this.showSuccess('Portfolio saved!');
      },
      error: (err: any) => {
        this.showError('Failed to save portfolio');
        this.saving = false;
        console.error(err);
      }
    });
  }

  private showSuccess(msg: string): void {
    this.successMsg = msg;
    setTimeout(() => this.successMsg = null, 3000);
  }

  private showError(msg: string): void {
    this.error = msg;
    setTimeout(() => this.error = null, 5000);
  }

  // ── Experience ──
  addExperience(): void {
    if (!this.newExperience.company || !this.newExperience.position) return;
    this.data.workExperiences.push({
      company: this.newExperience.company!,
      position: this.newExperience.position!,
      startDate: this.newExperience.startDate || new Date(),
      endDate: this.newExperience.endDate,
      description: this.newExperience.description || ''
    });
    this.newExperience = {};
  }

  removeExperience(i: number): void {
    this.data.workExperiences.splice(i, 1);
  }

  // ── Education ──
  addEducation(): void {
    if (!this.newEducation.institution || !this.newEducation.degree) return;
    this.data.education.push({
      institution: this.newEducation.institution!,
      degree: this.newEducation.degree!,
      fieldOfStudy: this.newEducation.fieldOfStudy || '',
      graduationDate: this.newEducation.graduationDate || new Date()
    });
    this.newEducation = {};
  }

  removeEducation(i: number): void {
    this.data.education.splice(i, 1);
  }

  // ── Skills ──
  addSkill(): void {
    if (!this.newSkill.name) return;
    this.data.skills.push({
      name: this.newSkill.name!,
      level: this.newSkill.level || 70,
      category: this.newSkill.category || 'General'
    });
    this.newSkill = { level: 70 };
  }

  removeSkill(i: number): void {
    this.data.skills.splice(i, 1);
  }

  // ── Projects ──
  addProject(): void {
    if (!this.newProject.name) return;
    this.data.projects.push({
      name: this.newProject.name!,
      description: this.newProject.description || '',
      url: this.newProject.url,
      technologies: this.newProject.technologies || []
    });
    this.newProject = { technologies: [] };
    this.newTech = '';
  }

  addTech(): void {
    if (this.newTech.trim() && this.newProject.technologies) {
      this.newProject.technologies!.push(this.newTech.trim());
      this.newTech = '';
    }
  }

  removeTech(i: number): void {
    this.newProject.technologies?.splice(i, 1);
  }

  removeProject(i: number): void {
    this.data.projects.splice(i, 1);
  }

  // ── Certifications ──
  addCertification(): void {
    if (!this.newCertification.name) return;
    this.data.certifications.push({
      name: this.newCertification.name!,
      issuingOrganization: this.newCertification.issuingOrganization || '',
      issueDate: this.newCertification.issueDate || new Date(),
      expirationDate: this.newCertification.expirationDate
    });
    this.newCertification = {};
  }

  removeCertification(i: number): void {
    this.data.certifications.splice(i, 1);
  }
}
