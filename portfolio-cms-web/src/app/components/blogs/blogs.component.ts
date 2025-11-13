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
    
    this.blogService.getAll().subscribe({
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

  getStatusClass(isPublished: boolean): string {
    return isPublished ? 'status-published' : 'status-draft';
  }

  getStatusText(isPublished: boolean): string {
    return isPublished ? 'Published' : 'Draft';
  }
}
