# Angular Components - Implementation Guide

This guide provides the remaining component implementations for the Portfolio CMS web application.

## Components Status

- ✅ **LoginComponent** - FULLY IMPLEMENTED
- ✅ **NavbarComponent** - FULLY IMPLEMENTED
- ⚠️ **DashboardComponent** - SKELETON (needs implementation)
- ⚠️ **BlogsComponent** - SKELETON (needs implementation)
- ⚠️ **BlogFormComponent** - SKELETON (needs implementation)
- ⚠️ **PortfoliosComponent** - SKELETON (needs implementation)
- ⚠️ **PortfolioFormComponent** - SKELETON (needs implementation)
- ⚠️ **UsersComponent** - SKELETON (needs implementation)
- ⚠️ **TenantsComponent** - SKELETON (needs implementation)

## Quick Implementation Templates

### Dashboard Component

**TypeScript (dashboard.component.ts):**
```typescript
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { BlogService } from '../../services/blog.service';
import { PortfolioService } from '../../services/portfolio.service';
import { UserService } from '../../services/user.service';

@Component({
  selector: 'app-dashboard',
  imports: [CommonModule, RouterModule],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss'
})
export class DashboardComponent implements OnInit {
  stats = {
    totalBlogs: 0,
    publishedBlogs: 0,
    totalPortfolios: 0,
    totalUsers: 0
  };
  loading = true;

  constructor(
    private blogService: BlogService,
    private portfolioService: PortfolioService,
    private userService: UserService
  ) {}

  ngOnInit(): void {
    this.loadStats();
  }

  loadStats(): void {
    this.blogService.getAll(false).subscribe(blogs => {
      this.stats.totalBlogs = blogs.length;
      this.stats.publishedBlogs = blogs.filter(b => b.isPublished).length;
    });

    this.portfolioService.getAll().subscribe(portfolios => {
      this.stats.totalPortfolios = portfolios.length;
    });

    this.userService.getAll().subscribe(users => {
      this.stats.totalUsers = users.length;
      this.loading = false;
    });
  }
}
```

**HTML (dashboard.component.html):**
```html
<div class="dashboard-container">
  <h1>Dashboard</h1>

  <div class="stats-grid" *ngIf="!loading">
    <div class="stat-card">
      <h3>Total Blogs</h3>
      <p class="stat-number">{{ stats.totalBlogs }}</p>
      <a routerLink="/blogs" class="stat-link">View all →</a>
    </div>

    <div class="stat-card">
      <h3>Published Blogs</h3>
      <p class="stat-number">{{ stats.publishedBlogs }}</p>
    </div>

    <div class="stat-card">
      <h3>Portfolios</h3>
      <p class="stat-number">{{ stats.totalPortfolios }}</p>
      <a routerLink="/portfolios" class="stat-link">View all →</a>
    </div>

    <div class="stat-card">
      <h3>Users</h3>
      <p class="stat-number">{{ stats.totalUsers }}</p>
      <a routerLink="/users" class="stat-link">Manage →</a>
    </div>
  </div>

  <div class="quick-actions">
    <h2>Quick Actions</h2>
    <button routerLink="/blogs/new" class="btn btn-primary">Create New Blog</button>
    <button routerLink="/portfolios/new" class="btn btn-primary">Create New Portfolio</button>
  </div>
</div>
```

### Blogs Component

**TypeScript (blogs.component.ts):**
```typescript
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { BlogService } from '../../services/blog.service';
import { Blog } from '../../models';

@Component({
  selector: 'app-blogs',
  imports: [CommonModule, RouterModule],
  templateUrl: './blogs.component.html',
  styleUrl: './blogs.component.scss'
})
export class BlogsComponent implements OnInit {
  blogs: Blog[] = [];
  loading = false;
  error = '';

  constructor(private blogService: BlogService) {}

  ngOnInit(): void {
    this.loadBlogs();
  }

  loadBlogs(): void {
    this.loading = true;
    this.blogService.getAll(false).subscribe({
      next: (blogs) => {
        this.blogs = blogs;
        this.loading = false;
      },
      error: (err) => {
        this.error = 'Failed to load blogs';
        this.loading = false;
        console.error(err);
      }
    });
  }

  deleteBlog(id: string): void {
    if (confirm('Are you sure you want to delete this blog?')) {
      this.blogService.delete(id).subscribe({
        next: () => {
          this.blogs = this.blogs.filter(b => b.id !== id);
        },
        error: (err) => {
          this.error = 'Failed to delete blog';
          console.error(err);
        }
      });
    }
  }
}
```

**HTML (blogs.component.html):**
```html
<div class="blogs-container">
  <div class="header">
    <h1>Blogs</h1>
    <button routerLink="/blogs/new" class="btn btn-primary">Create New Blog</button>
  </div>

  <div *ngIf="error" class="alert alert-error">{{ error }}</div>

  <div *ngIf="loading" class="loading">Loading blogs...</div>

  <div class="blogs-grid" *ngIf="!loading">
    <div class="blog-card" *ngFor="let blog of blogs">
      <h3>{{ blog.title }}</h3>
      <p class="blog-summary">{{ blog.summary }}</p>
      <div class="blog-meta">
        <span class="status" [class.published]="blog.isPublished">
          {{ blog.isPublished ? 'Published' : 'Draft' }}
        </span>
        <span class="views">{{ blog.views }} views</span>
      </div>
      <div class="blog-tags">
        <span class="tag" *ngFor="let tag of blog.tags">{{ tag }}</span>
      </div>
      <div class="blog-actions">
        <button [routerLink]="['/blogs/edit', blog.id]" class="btn btn-sm">Edit</button>
        <button (click)="deleteBlog(blog.id)" class="btn btn-sm btn-danger">Delete</button>
      </div>
    </div>
  </div>

  <div *ngIf="!loading && blogs.length === 0" class="empty-state">
    <p>No blogs yet. Create your first blog!</p>
    <button routerLink="/blogs/new" class="btn btn-primary">Create Blog</button>
  </div>
</div>
```

## Global Styles (src/styles.scss)

Add these global styles for consistent UI:

```scss
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, sans-serif;
  background-color: #f5f7fa;
  color: #333;
}

.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem;
}

h1 {
  font-size: 2rem;
  margin-bottom: 1.5rem;
  color: #333;
}

h2 {
  font-size: 1.5rem;
  margin-bottom: 1rem;
  color: #555;
}

.btn {
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 8px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s;

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
}

.btn-primary {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;

  &:hover:not(:disabled) {
    transform: translateY(-2px);
    box-shadow: 0 5px 20px rgba(102, 126, 234, 0.4);
  }
}

.btn-sm {
  padding: 0.5rem 1rem;
  font-size: 0.875rem;
}

.btn-danger {
  background-color: #dc3545;
  color: white;

  &:hover {
    background-color: #c82333;
  }
}

.alert {
  padding: 1rem;
  border-radius: 8px;
  margin-bottom: 1rem;
}

.alert-error {
  background-color: #fee;
  color: #c33;
  border: 1px solid #fcc;
}

.loading {
  text-align: center;
  padding: 2rem;
  color: #667eea;
  font-size: 1.1rem;
}

.empty-state {
  text-align: center;
  padding: 3rem;
  background: white;
  border-radius: 12px;

  p {
    margin-bottom: 1.5rem;
    color: #666;
  }
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1.5rem;
  margin-bottom: 2rem;
}

.stat-card {
  background: white;
  padding: 1.5rem;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);

  h3 {
    color: #667eea;
    font-size: 0.9rem;
    font-weight: 600;
    text-transform: uppercase;
    margin-bottom: 0.5rem;
  }

  .stat-number {
    font-size: 2.5rem;
    font-weight: 700;
    color: #333;
    margin-bottom: 0.5rem;
  }

  .stat-link {
    color: #667eea;
    text-decoration: none;
    font-weight: 500;

    &:hover {
      text-decoration: underline;
    }
  }
}

.blogs-grid,
.portfolios-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
  gap: 1.5rem;
}

.blog-card,
.portfolio-card {
  background: white;
  padding: 1.5rem;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  transition: transform 0.3s, box-shadow 0.3s;

  &:hover {
    transform: translateY(-4px);
    box-shadow: 0 4px 16px rgba(0, 0, 0, 0.15);
  }

  h3 {
    color: #333;
    margin-bottom: 0.75rem;
  }

  .blog-summary {
    color: #666;
    margin-bottom: 1rem;
    line-height: 1.5;
  }

  .blog-meta {
    display: flex;
    gap: 1rem;
    margin-bottom: 1rem;
    font-size: 0.875rem;

    .status {
      padding: 0.25rem 0.75rem;
      border-radius: 20px;
      background-color: #ffc107;
      color: #333;
      font-weight: 600;

      &.published {
        background-color: #28a745;
        color: white;
      }
    }

    .views {
      color: #999;
    }
  }

  .blog-tags {
    display: flex;
    gap: 0.5rem;
    flex-wrap: wrap;
    margin-bottom: 1rem;

    .tag {
      padding: 0.25rem 0.75rem;
      background-color: #e9ecef;
      border-radius: 16px;
      font-size: 0.75rem;
      color: #667eea;
    }
  }

  .blog-actions {
    display: flex;
    gap: 0.75rem;
    justify-content: flex-end;
  }
}
```

## Running the Completed Application

1. **Start Backend API:**
   ```bash
   cd portfolio.api
   docker-compose -f deploy/docker-compose.yml up -d
   ```

2. **Start Frontend:**
   ```bash
   cd portfolio-cms-web
   npm install
   ng serve
   ```

3. **Access Application:**
   - Frontend: http://localhost:4200
   - Backend API: http://localhost:5000
   - Swagger UI: http://localhost:5000/swagger

4. **Login:**
   - First create a tenant via Swagger
   - Then create a user
   - Use tenant ID, email, and password to login

## Remaining Implementation Tasks

1. **Complete Component Logic** - Implement CRUD operations in all component TypeScript files
2. **Add Forms** - Implement BlogFormComponent and PortfolioFormComponent with reactive forms
3. **Add Validation** - Form validation and error messages
4. **Loading States** - Skeleton screens and spinners
5. **Error Handling** - Better error messages and recovery
6. **Responsive Design** - Mobile-friendly layouts
7. **Rich Text Editor** - For blog content (e.g., Quill, TinyMCE)
8. **Image Upload** - For blog and portfolio images
9. **Pagination** - For large lists
10. **Search/Filter** - Search and filter functionality

## File Locations

All component files are located in:
```
portfolio-cms-web/src/app/components/<component-name>/
  ├── <component-name>.component.ts
  ├── <component-name>.component.html
  └── <component-name>.component.scss
```

Services are in:
```
portfolio-cms-web/src/app/services/
```

Models are in:
```
portfolio-cms-web/src/app/models/index.ts
```

## Additional Resources

- Angular Documentation: https://angular.dev
- RxJS Documentation: https://rxjs.dev
- Backend API Documentation: ../portfolio.api/docs/API.md
- TypeScript Handbook: https://www.typescriptlang.org/docs/

---

**Note:** All services, guards, interceptors, and models are fully implemented. Only component logic and HTML templates need to be completed for a fully functional application.
