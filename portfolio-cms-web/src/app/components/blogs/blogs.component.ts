import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { BlogService } from '../../services/blog.service';
import { Blog } from '../../models';

@Component({
  selector: 'app-blogs',
  imports: [CommonModule],
  templateUrl: './blogs.component.html',
  styleUrl: './blogs.component.scss'
})
export class BlogsComponent implements OnInit {
  blogs: Blog[] = [];
  loading = true;
  error: string | null = null;

  constructor(
    private blogService: BlogService,
    private router: Router
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
    this.router.navigate(['/blogs/new']);
  }

  editBlog(id: string): void {
    this.router.navigate(['/blogs/edit', id]);
  }

  togglePublish(blog: Blog): void {
    const newState = !blog.isPublished;
    this.blogService.togglePublish(blog.id, newState).subscribe({
      next: (updated) => {
        const index = this.blogs.findIndex(b => b.id === blog.id);
        if (index !== -1) {
          this.blogs[index] = updated;
        }
      },
      error: (err) => {
        alert(`Failed to ${newState ? 'publish' : 'unpublish'} blog`);
        console.error('Error toggling publish:', err);
      }
    });
  }

  deleteBlog(id: string, title: string): void {
    if (confirm(`Are you sure you want to delete "${title}"?`)) {
      this.blogService.delete(id).subscribe({
        next: () => {
          this.blogs = this.blogs.filter(b => b.id !== id);
        },
        error: (err) => {
          alert('Failed to delete blog');
          console.error('Error deleting blog:', err);
        }
      });
    }
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
    return isPublished ? 'Published' : 'Draft';
  }
}
