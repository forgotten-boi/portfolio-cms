import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { PortfolioService } from '../../services/portfolio.service';
import { TranslatePipe } from '../../pipes/translate.pipe';
import { Portfolio, Skill, WorkExperience, Education, Project, Certification } from '../../models';

interface CvSection {
  id: string;
  icon: string;
  nameKey: string;
  active: boolean;
}

@Component({
  selector: 'app-cv-manager',
  imports: [CommonModule, FormsModule, RouterModule, TranslatePipe],
  templateUrl: './cv-manager.component.html',
  styleUrl: './cv-manager.component.scss'
})
export class CvManagerComponent implements OnInit {
  portfolio: Portfolio | null = null;
  loading = true;
  saving = false;
  error = '';
  successMsg = '';

  sections: CvSection[] = [
    { id: 'summary', icon: '📝', nameKey: 'cv.summary', active: true },
    { id: 'skills', icon: '⚡', nameKey: 'cv.skills', active: false },
    { id: 'experience', icon: '💼', nameKey: 'cv.experience', active: false },
    { id: 'projects', icon: '🔧', nameKey: 'cv.projects', active: false },
    { id: 'education', icon: '🎓', nameKey: 'cv.education', active: false },
    { id: 'certifications', icon: '🏅', nameKey: 'cv.certifications', active: false }
  ];

  activeSection = 'summary';

  // Form data
  summary = '';
  skills: Skill[] = [];
  experiences: WorkExperience[] = [];
  projects: Project[] = [];
  educations: Education[] = [];
  certifications: Certification[] = [];

  newSkill: Partial<Skill> = { name: '', level: 3, category: '' };
  newExperience: Partial<WorkExperience> = { company: '', position: '', description: '' };
  newProject: Partial<Project> = { name: '', description: '', technologies: [] };
  newEducation: Partial<Education> = { institution: '', degree: '', fieldOfStudy: '' };
  newCertification: Partial<Certification> = { name: '', issuingOrganization: '' };
  newTechInput = '';

  constructor(private portfolioService: PortfolioService) {}

  ngOnInit(): void {
    this.loadPortfolio();
  }

  loadPortfolio(): void {
    this.loading = true;
    this.portfolioService.getAll().subscribe({
      next: (portfolios) => {
        if (portfolios.length > 0) {
          this.portfolio = portfolios[0];
          this.summary = this.portfolio.bio || '';
          this.skills = this.portfolio.data?.skills || [];
          this.experiences = this.portfolio.data?.workExperiences || [];
          this.projects = this.portfolio.data?.projects || [];
          this.educations = this.portfolio.data?.education || [];
          this.certifications = this.portfolio.data?.certifications || [];
        }
        this.loading = false;
      },
      error: () => {
        this.error = 'Failed to load CV data';
        this.loading = false;
      }
    });
  }

  selectSection(id: string): void {
    this.activeSection = id;
    this.sections.forEach(s => s.active = s.id === id);
  }

  addSkill(): void {
    if (this.newSkill.name) {
      this.skills.push({
        name: this.newSkill.name,
        level: this.newSkill.level || 3,
        category: this.newSkill.category || 'General'
      });
      this.newSkill = { name: '', level: 3, category: '' };
    }
  }

  removeSkill(index: number): void {
    this.skills.splice(index, 1);
  }

  addExperience(): void {
    if (this.newExperience.company && this.newExperience.position) {
      this.experiences.push({
        company: this.newExperience.company!,
        position: this.newExperience.position!,
        startDate: new Date(),
        description: this.newExperience.description || ''
      });
      this.newExperience = { company: '', position: '', description: '' };
    }
  }

  removeExperience(index: number): void {
    this.experiences.splice(index, 1);
  }

  addProject(): void {
    if (this.newProject.name) {
      this.projects.push({
        name: this.newProject.name!,
        description: this.newProject.description || '',
        technologies: this.newProject.technologies || []
      });
      this.newProject = { name: '', description: '', technologies: [] };
      this.newTechInput = '';
    }
  }

  removeProject(index: number): void {
    this.projects.splice(index, 1);
  }

  addTech(): void {
    if (this.newTechInput.trim()) {
      if (!this.newProject.technologies) this.newProject.technologies = [];
      this.newProject.technologies.push(this.newTechInput.trim());
      this.newTechInput = '';
    }
  }

  removeTech(index: number): void {
    this.newProject.technologies?.splice(index, 1);
  }

  addEducation(): void {
    if (this.newEducation.institution && this.newEducation.degree) {
      this.educations.push({
        institution: this.newEducation.institution!,
        degree: this.newEducation.degree!,
        fieldOfStudy: this.newEducation.fieldOfStudy || '',
        graduationDate: new Date()
      });
      this.newEducation = { institution: '', degree: '', fieldOfStudy: '' };
    }
  }

  removeEducation(index: number): void {
    this.educations.splice(index, 1);
  }

  addCertification(): void {
    if (this.newCertification.name) {
      this.certifications.push({
        name: this.newCertification.name!,
        issuingOrganization: this.newCertification.issuingOrganization || '',
        issueDate: new Date()
      });
      this.newCertification = { name: '', issuingOrganization: '' };
    }
  }

  removeCertification(index: number): void {
    this.certifications.splice(index, 1);
  }

  save(): void {
    this.saving = true;
    this.successMsg = '';
    this.error = '';

    const data = {
      workExperiences: this.experiences,
      education: this.educations,
      skills: this.skills,
      projects: this.projects,
      certifications: this.certifications
    };

    if (this.portfolio) {
      this.portfolioService.update(this.portfolio.id, {
        title: this.portfolio.title,
        subtitle: this.portfolio.subtitle,
        bio: this.summary,
        template: this.portfolio.template,
        isPublished: this.portfolio.isPublished,
        featuredBlogsEnabled: this.portfolio.featuredBlogsEnabled,
        data
      }).subscribe({
        next: () => {
          this.saving = false;
          this.successMsg = 'CV saved successfully!';
          setTimeout(() => this.successMsg = '', 3000);
        },
        error: () => {
          this.saving = false;
          this.error = 'Failed to save CV';
        }
      });
    } else {
      this.portfolioService.create({
        title: 'My Portfolio CV',
        subtitle: 'Professional',
        bio: this.summary,
        template: 'Modern',
        isPublished: false,
        featuredBlogsEnabled: false,
        data
      }).subscribe({
        next: (created) => {
          this.portfolio = created;
          this.saving = false;
          this.successMsg = 'CV created successfully!';
          setTimeout(() => this.successMsg = '', 3000);
        },
        error: () => {
          this.saving = false;
          this.error = 'Failed to create CV';
        }
      });
    }
  }

  getSkillLevelLabel(level: number): string {
    const labels = ['Beginner', 'Elementary', 'Intermediate', 'Advanced', 'Expert'];
    return labels[Math.min(level - 1, 4)] || 'Intermediate';
  }
}
