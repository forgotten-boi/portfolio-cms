import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { BlogService } from '../../services/blog.service';
import { Blog } from '../../models';

@Component({
  selector: 'app-public-blog',
  imports: [CommonModule, RouterModule],
  templateUrl: './public-blog.component.html',
  styleUrl: './public-blog.component.scss'
})
export class PublicBlogComponent implements OnInit {
  blog: any = null;
  loading = true;
  error: string | null = null;
  safeContent: SafeHtml | null = null;
  relatedBlogs: Blog[] = [];

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
        this.loadRelatedBlogs(blog);
      },
      error: (err: any) => {
        console.error('Error loading blog:', err);
        this.error = 'Blog not found';
        this.loading = false;
      }
    });
  }

  private loadRelatedBlogs(currentBlog: any): void {
    const currentTags: string[] = currentBlog.tags || [];
    if (currentTags.length === 0) return;

    this.blogService.getAll(true, 1, 50).subscribe({
      next: (blogs: Blog[]) => {
        const others = blogs.filter(b => b.id !== currentBlog.id && b.isPublished);
        const lowerTags = currentTags.map((t: string) => t.toLowerCase());

        // Score by number of matching tags
        const scored = others.map(b => {
          const blogTags = (b.tags || []).map(t => t.toLowerCase());
          const matchCount = lowerTags.filter(t => blogTags.includes(t)).length;
          return { blog: b, score: matchCount };
        }).filter(s => s.score > 0);

        // Sort by score descending, then shuffle ties
        scored.sort((a, b) => b.score - a.score || Math.random() - 0.5);

        this.relatedBlogs = scored.slice(0, 5).map(s => s.blog);

        // If fewer than 5 matched, fill with random others
        if (this.relatedBlogs.length < 5) {
          const usedIds = new Set([currentBlog.id, ...this.relatedBlogs.map(b => b.id)]);
          const remaining = others.filter(b => !usedIds.has(b.id));
          // Shuffle remaining
          for (let i = remaining.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [remaining[i], remaining[j]] = [remaining[j], remaining[i]];
          }
          this.relatedBlogs = [...this.relatedBlogs, ...remaining.slice(0, 5 - this.relatedBlogs.length)];
        }
      },
      error: () => { /* silently ignore related blogs errors */ }
    });
  }

  shareOnLinkedIn(): void {
    const url = encodeURIComponent(window.location.href);
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

  formatDate(date: string | Date): string {
    if (!date) return '';
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }
}
