import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { TranslatePipe } from '../../pipes/translate.pipe';

interface SkillGap {
  skill: string;
  required: boolean;
  present: boolean;
  level: 'strong' | 'partial' | 'missing';
}

interface JobAnalysis {
  title: string;
  company: string;
  matchScore: number;
  skills: SkillGap[];
  suggestions: string[];
  keywords: string[];
}

@Component({
  selector: 'app-job-matcher',
  imports: [CommonModule, FormsModule, RouterModule, TranslatePipe],
  templateUrl: './job-matcher.component.html',
  styleUrl: './job-matcher.component.scss'
})
export class JobMatcherComponent implements OnInit {
  jobDescription = '';
  analyzing = false;
  analysis: JobAnalysis | null = null;

  // Sample analyses for demo
  private sampleAnalyses: JobAnalysis[] = [
    {
      title: 'Senior Frontend Developer',
      company: 'Tech Corp',
      matchScore: 82,
      skills: [
        { skill: 'Angular', required: true, present: true, level: 'strong' },
        { skill: 'TypeScript', required: true, present: true, level: 'strong' },
        { skill: 'RxJS', required: true, present: true, level: 'partial' },
        { skill: 'Node.js', required: true, present: true, level: 'strong' },
        { skill: 'GraphQL', required: true, present: false, level: 'missing' },
        { skill: 'Docker', required: false, present: true, level: 'partial' },
        { skill: 'CI/CD', required: true, present: false, level: 'missing' },
        { skill: 'Unit Testing', required: true, present: true, level: 'strong' }
      ],
      suggestions: [
        'Add GraphQL experience to your CV — consider completing a small project',
        'Highlight your CI/CD pipeline experience if you have any',
        'Emphasize your Angular expertise as the primary skill requirement',
        'Include specific metrics for projects where possible'
      ],
      keywords: ['Angular', 'TypeScript', 'SPA', 'REST API', 'Agile', 'Scrum', 'TDD', 'Performance Optimization']
    }
  ];

  recentMatches: { title: string; company: string; score: number; date: Date }[] = [
    { title: 'Full Stack Developer', company: 'StartupXYZ', score: 74, date: new Date(Date.now() - 86400000 * 2) },
    { title: 'Angular Lead', company: 'Enterprise Inc', score: 91, date: new Date(Date.now() - 86400000 * 5) },
    { title: 'Software Engineer', company: 'BigTech', score: 68, date: new Date(Date.now() - 86400000 * 7) }
  ];

  constructor() {}

  ngOnInit(): void {}

  analyzeJob(): void {
    if (!this.jobDescription.trim()) return;
    this.analyzing = true;
    this.analysis = null;

    // Simulate AI analysis with loading delay
    setTimeout(() => {
      this.analysis = { ...this.sampleAnalyses[0] };
      // Randomize score slightly
      this.analysis.matchScore = Math.min(100, Math.max(50, 82 + Math.floor(Math.random() * 20 - 10)));
      this.analyzing = false;
    }, 2000);
  }

  get matchDashArray(): string {
    if (!this.analysis) return '0, 999';
    const circumference = 2 * Math.PI * 52;
    const filled = (this.analysis.matchScore / 100) * circumference;
    return `${filled}, ${circumference - filled}`;
  }

  get strongSkills(): SkillGap[] {
    return this.analysis?.skills.filter(s => s.level === 'strong') || [];
  }

  get partialSkills(): SkillGap[] {
    return this.analysis?.skills.filter(s => s.level === 'partial') || [];
  }

  get missingSkills(): SkillGap[] {
    return this.analysis?.skills.filter(s => s.level === 'missing') || [];
  }

  getScoreColor(score: number): string {
    if (score >= 80) return '#22c55e';
    if (score >= 60) return '#f59e0b';
    return '#ef4444';
  }

  getScoreLabel(score: number): string {
    if (score >= 80) return 'Strong Match';
    if (score >= 60) return 'Moderate Match';
    return 'Needs Improvement';
  }

  clearAnalysis(): void {
    this.analysis = null;
    this.jobDescription = '';
  }
}
