import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { TranslatePipe } from '../../pipes/translate.pipe';
import { NotificationService } from '../../services/notification.service';

interface ResumeTemplate {
  id: string;
  name: string;
  icon: string;
  description: string;
}

interface ResumeVariant {
  id: string;
  name: string;
  template: string;
  targetCompany: string;
  tone: string;
  createdAt: Date;
  format: string;
}

@Component({
  selector: 'app-resume-generator',
  imports: [CommonModule, FormsModule, RouterModule, TranslatePipe],
  templateUrl: './resume-generator.component.html',
  styleUrl: './resume-generator.component.scss'
})
export class ResumeGeneratorComponent implements OnInit {
  // Configuration
  targetCompany = '';
  targetRole = '';
  tone: 'professional' | 'creative' | 'executive' | 'minimal' = 'professional';
  length: 'concise' | 'standard' | 'detailed' = 'standard';
  selectedTemplate = 'modern';
  includePhoto = true;
  includeSummary = true;
  includeSkills = true;
  includeExperience = true;
  includeProjects = true;
  includeEducation = true;
  includeCertifications = true;

  generating = false;
  previewReady = false;

  templates: ResumeTemplate[] = [
    { id: 'modern', name: 'Modern', icon: '🎨', description: 'Clean two-column layout' },
    { id: 'classic', name: 'Classic', icon: '📋', description: 'Traditional single-column' },
    { id: 'creative', name: 'Creative', icon: '✨', description: 'Bold colors and layout' },
    { id: 'executive', name: 'Executive', icon: '👔', description: 'Formal and structured' },
    { id: 'minimal', name: 'Minimal', icon: '⚪', description: 'Simple and elegant' }
  ];

  tones = [
    { id: 'professional', label: 'Professional', icon: '👔' },
    { id: 'creative', label: 'Creative', icon: '🎨' },
    { id: 'executive', label: 'Executive', icon: '🏢' },
    { id: 'minimal', label: 'Minimal', icon: '⬜' }
  ];

  lengths = [
    { id: 'concise', label: '1 Page' },
    { id: 'standard', label: '1-2 Pages' },
    { id: 'detailed', label: '2+ Pages' }
  ];

  // Preview data
  previewSections = [
    'Professional Summary',
    'Technical Skills',
    'Work Experience',
    'Projects',
    'Education',
    'Certifications'
  ];

  // Saved variants
  savedVariants: ResumeVariant[] = [
    { id: '1', name: 'General Resume v3', template: 'Modern', targetCompany: '', tone: 'professional', createdAt: new Date(Date.now() - 86400000), format: 'PDF' },
    { id: '2', name: 'Google Application', template: 'Classic', targetCompany: 'Google', tone: 'professional', createdAt: new Date(Date.now() - 86400000 * 3), format: 'PDF' },
    { id: '3', name: 'Startup Resume', template: 'Creative', targetCompany: 'YC Startup', tone: 'creative', createdAt: new Date(Date.now() - 86400000 * 7), format: 'DOCX' }
  ];

  constructor(private notificationService: NotificationService) {}

  ngOnInit(): void {}

  generateResume(): void {
    this.generating = true;
    this.previewReady = false;
    setTimeout(() => {
      this.generating = false;
      this.previewReady = true;
    }, 2500);
  }

  selectTemplate(id: string): void {
    this.selectedTemplate = id;
  }

  exportAs(format: string): void {
    // Placeholder for export functionality
    this.notificationService.info(`Exporting as ${format}...`);
  }

  deleteVariant(id: string): void {
    this.savedVariants = this.savedVariants.filter(v => v.id !== id);
  }

  get activeSections(): string[] {
    const sections: string[] = [];
    if (this.includeSummary) sections.push('Summary');
    if (this.includeSkills) sections.push('Skills');
    if (this.includeExperience) sections.push('Experience');
    if (this.includeProjects) sections.push('Projects');
    if (this.includeEducation) sections.push('Education');
    if (this.includeCertifications) sections.push('Certifications');
    return sections;
  }
}
