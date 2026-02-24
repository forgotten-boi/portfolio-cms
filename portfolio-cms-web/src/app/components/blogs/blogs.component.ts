import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { BlogService } from '../../services/blog.service';
import { NotificationService } from '../../services/notification.service';
import { Blog } from '../../models';
import { TranslatePipe } from '../../pipes/translate.pipe';
import { TranslationService } from '../../services/translation.service';

@Component({
  selector: 'app-blogs',
  imports: [CommonModule, TranslatePipe],
  templateUrl: './blogs.component.html',
  styleUrl: './blogs.component.scss'
})
export class BlogsComponent implements OnInit {
  blogs: Blog[] = [];
  loading = true;
  error: string | null = null;
  confirmDeleteId: string | null = null;

  constructor(
    private blogService: BlogService,
    private router: Router,
    private translationService: TranslationService,
    private notificationService: NotificationService
  ) {}

  ngOnInit(): void {
    this.loadBlogs();
  }

  loadBlogs(): void {
    this.loading = true;
    this.error = null;
    
    this.blogService.getMyBlogs().subscribe({
      next: (blogs) => {
        this.blogs = blogs;
        this.loading = false;
      },
      error: (err) => {
        this.error = 'Failed to load blogs';
        this.loading = false;
        console.error('Error loading blogs:', err);
      }
    });
  }

  createBlog(): void {
    this.router.navigate(['/dashboard/blogs/new']);
  }

  editBlog(id: string): void {
    this.router.navigate(['/dashboard/blogs/edit', id]);
  }

  // deleteBlog(id: string, title: string): void {
  //   if (confirm(this.translationService.t('blogs.confirmDelete'))) {
  //     this.blogService.delete(id).subscribe({
  //       next: () => {
  //         this.blogs = this.blogs.filter(b => b.id !== id);
  //       },
  //       error: (err) => {
  //         alert('Failed to delete blog');
  //         console.error('Error deleting blog:', err);
  //       }
  //     });
  //   }
  // }
  togglePublish(blog: Blog): void {
    const newState = !blog.isPublished;
    this.blogService.togglePublish(blog.id, newState).subscribe({
      next: (updated) => {
        const index = this.blogs.findIndex(b => b.id === blog.id);
        if (index !== -1) {
          this.blogs[index] = updated;
        }
        this.notificationService.success(
          newState ? `"${blog.title}" published successfully` : `"${blog.title}" unpublished`
        );
      },
      error: (err) => {
        this.notificationService.error(`Failed to ${newState ? 'publish' : 'unpublish'} blog`);
        console.error('Error toggling publish:', err);
      }
    });
  }

  deleteBlog(id: string): void {
    this.confirmDeleteId = id;
  }

  confirmDelete(): void {
    if (!this.confirmDeleteId) return;
    const id = this.confirmDeleteId;
    this.confirmDeleteId = null;
    this.blogService.delete(id).subscribe({
      next: () => {
        this.blogs = this.blogs.filter(b => b.id !== id);
        this.notificationService.success('Blog deleted successfully');
      },
      error: (err) => {
        this.notificationService.error('Failed to delete blog');
        console.error('Error deleting blog:', err);
      }
    });
  }

  cancelDelete(): void {
    this.confirmDeleteId = null;
  }

  copyPublicLink(blog: Blog): void {
    const url = `${window.location.origin}/blog/${blog.slug}`;
    navigator.clipboard.writeText(url).then(() => {
      this.notificationService.success('Blog link copied to clipboard!');
    }).catch(() => {
      this.notificationService.info(`Public link: ${url}`);
    });
  }

  shareOnLinkedIn(blog: Blog): void {
    const url = encodeURIComponent(`${window.location.origin}/blog/${blog.slug}`);
    window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${url}`, '_blank');
  }

  shareOnFacebook(blog: Blog): void {
    const url = encodeURIComponent(`${window.location.origin}/blog/${blog.slug}`);
    window.open(`https://www.facebook.com/sharer/sharer.php?u=${url}`, '_blank');
  }

  getStatusClass(isPublished: boolean): string {
    return isPublished ? 'status-published' : 'status-draft';
  }

  getStatusText(isPublished: boolean): string {
    return isPublished ? this.translationService.t('blogs.published') : this.translationService.t('blogs.draft');
  }

  copyBlogLink(slug: string): void {
    const url = `${window.location.origin}/blog/${slug}`;
    navigator.clipboard.writeText(url).then(() => {
      this.notificationService.success('Blog link copied to clipboard!');
    }).catch(() => {
      this.notificationService.info(`Blog link: ${url}`);
    });
  }
}

