import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { BlogService } from '../../services/blog.service';

@Component({
  selector: 'app-public-blog',
  imports: [CommonModule],
  templateUrl: './public-blog.component.html',
  styleUrl: './public-blog.component.scss'
})
export class PublicBlogComponent implements OnInit {
  blog: any = null;
  loading = true;
  error: string | null = null;
  safeContent: SafeHtml | null = null;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private blogService: BlogService,
    private sanitizer: DomSanitizer
  ) {}

  ngOnInit(): void {
    const slug = this.route.snapshot.paramMap.get('slug');
    if (!slug) {
      this.error = 'Blog not found';
      this.loading = false;
      return;
    }

    this.blogService.getPublicBySlug(slug).subscribe({
      next: (blog: any) => {
        if (!blog || !blog.isPublished) {
          this.error = 'Blog not found or not published';
          this.loading = false;
          return;
        }

        this.blog = blog;
        this.safeContent = this.sanitizer.bypassSecurityTrustHtml(blog.content);
        this.loading = false;
      },
      error: (err: any) => {
        console.error('Error loading blog:', err);
        this.error = 'Blog not found';
        this.loading = false;
      }
    });
  }

  shareOnLinkedIn(): void {
    const url = encodeURIComponent(window.location.href);
    const title = encodeURIComponent(this.blog.title);
    window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${url}`, '_blank');
  }

  shareOnTwitter(): void {
    const url = encodeURIComponent(window.location.href);
    const text = encodeURIComponent(this.blog.title);
    window.open(`https://twitter.com/intent/tweet?url=${url}&text=${text}`, '_blank');
  }

  shareOnFacebook(): void {
    const url = encodeURIComponent(window.location.href);
    window.open(`https://www.facebook.com/sharer/sharer.php?u=${url}`, '_blank');
  }

  formatDate(date: string): string {
    if (!date) return '';
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }
}
