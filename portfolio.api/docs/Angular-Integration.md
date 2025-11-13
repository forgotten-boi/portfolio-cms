# Angular Integration Guide

This guide shows how to integrate the Portfolio CMS API with an Angular frontend application.

## Installation

```bash
npm install --save @angular/common @angular/core
```

## Configuration

### Environment Configuration

Create `src/environments/environment.ts`:

```typescript
export const environment = {
  production: false,
  apiUrl: 'http://localhost:5000/api',
  tenantId: 'your-tenant-guid-here'
};
```

For production (`src/environments/environment.prod.ts`):

```typescript
export const environment = {
  production: true,
  apiUrl: 'https://api.yourcompany.com/api',
  tenantId: 'production-tenant-guid'
};
```

---

## Core Services

### Auth Service

`src/app/services/auth.service.ts`:

```typescript
import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, BehaviorSubject } from 'rxjs';
import { tap } from 'rxjs/operators';
import { environment } from '../../environments/environment';

export interface LoginRequest {
  email: string;
  password: string;
  tenantId: string;
}

export interface AuthResult {
  success: boolean;
  token?: string;
  userId?: string;
  error?: string;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private readonly TOKEN_KEY = 'portfolio_jwt_token';
  private readonly USER_ID_KEY = 'portfolio_user_id';
  private isAuthenticatedSubject = new BehaviorSubject<boolean>(this.hasToken());
  
  public isAuthenticated$ = this.isAuthenticatedSubject.asObservable();

  constructor(private http: HttpClient) {}

  login(email: string, password: string): Observable<AuthResult> {
    const request: LoginRequest = {
      email,
      password,
      tenantId: environment.tenantId
    };

    return this.http.post<AuthResult>(`${environment.apiUrl}/auth/login`, request)
      .pipe(
        tap(result => {
          if (result.success && result.token) {
            this.setToken(result.token);
            this.setUserId(result.userId!);
            this.isAuthenticatedSubject.next(true);
          }
        })
      );
  }

  logout(): void {
    localStorage.removeItem(this.TOKEN_KEY);
    localStorage.removeItem(this.USER_ID_KEY);
    this.isAuthenticatedSubject.next(false);
  }

  getToken(): string | null {
    return localStorage.getItem(this.TOKEN_KEY);
  }

  getUserId(): string | null {
    return localStorage.getItem(this.USER_ID_KEY);
  }

  private setToken(token: string): void {
    localStorage.setItem(this.TOKEN_KEY, token);
  }

  private setUserId(userId: string): void {
    localStorage.setItem(this.USER_ID_KEY, userId);
  }

  private hasToken(): boolean {
    return !!this.getToken();
  }
}
```

---

### HTTP Interceptor for Authentication

`src/app/interceptors/auth.interceptor.ts`:

```typescript
import { Injectable } from '@angular/core';
import { HttpInterceptor, HttpRequest, HttpHandler, HttpEvent, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { environment } from '../../environments/environment';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {
  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    const token = this.authService.getToken();
    
    // Clone the request and add headers
    let clonedRequest = req.clone({
      setHeaders: {
        'X-Tenant-Id': environment.tenantId
      }
    });

    // Add Authorization header if token exists
    if (token) {
      clonedRequest = clonedRequest.clone({
        setHeaders: {
          'Authorization': `Bearer ${token}`,
          'X-Tenant-Id': environment.tenantId
        }
      });
    }

    return next.handle(clonedRequest).pipe(
      catchError((error: HttpErrorResponse) => {
        if (error.status === 401) {
          // Unauthorized - redirect to login
          this.authService.logout();
          this.router.navigate(['/login']);
        }
        return throwError(() => error);
      })
    );
  }
}
```

**Register in `app.module.ts`:**

```typescript
import { HTTP_INTERCEPTORS } from '@angular/common/http';
import { AuthInterceptor } from './interceptors/auth.interceptor';

@NgModule({
  providers: [
    { provide: HTTP_INTERCEPTORS, useClass: AuthInterceptor, multi: true }
  ]
})
export class AppModule { }
```

---

### Blog Service

`src/app/services/blog.service.ts`:

```typescript
import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface Blog {
  id: string;
  title: string;
  slug: string;
  content: string;
  summary: string;
  isPublished: boolean;
  publishedAt?: Date;
  authorId: string;
  tags: string[];
  views: number;
  createdAt: Date;
  updatedAt?: Date;
}

export interface CreateBlogRequest {
  title: string;
  content: string;
  summary: string;
  isPublished: boolean;
  publishedAt?: Date;
  tags: string[];
}

export interface UpdateBlogRequest extends CreateBlogRequest {
  id: string;
}

@Injectable({
  providedIn: 'root'
})
export class BlogService {
  private readonly baseUrl = `${environment.apiUrl}/blogs`;

  constructor(private http: HttpClient) {}

  getAll(publishedOnly: boolean = false, page: number = 1, pageSize: number = 10): Observable<Blog[]> {
    let params = new HttpParams()
      .set('publishedOnly', publishedOnly.toString())
      .set('page', page.toString())
      .set('pageSize', pageSize.toString());

    return this.http.get<Blog[]>(this.baseUrl, { params });
  }

  getById(id: string): Observable<Blog> {
    return this.http.get<Blog>(`${this.baseUrl}/${id}`);
  }

  getBySlug(slug: string): Observable<Blog> {
    return this.http.get<Blog>(`${this.baseUrl}/slug/${slug}`);
  }

  create(blog: CreateBlogRequest): Observable<Blog> {
    return this.http.post<Blog>(this.baseUrl, blog);
  }

  update(blog: UpdateBlogRequest): Observable<Blog> {
    return this.http.put<Blog>(`${this.baseUrl}/${blog.id}`, blog);
  }

  delete(id: string): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }
}
```

---

### Portfolio Service

`src/app/services/portfolio.service.ts`:

```typescript
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface Portfolio {
  id: string;
  userId: string;
  title: string;
  subtitle: string;
  bio: string;
  template: 'Modern' | 'Classic' | 'Minimalist' | 'Creative';
  isPublic: boolean;
  featuredBlogsEnabled: boolean;
  createdAt: Date;
  updatedAt?: Date;
  data: PortfolioData;
}

export interface PortfolioData {
  workExperiences: WorkExperience[];
  education: Education[];
  skills: Skill[];
  projects: Project[];
  certifications: Certification[];
}

export interface WorkExperience {
  company: string;
  position: string;
  startDate: Date;
  endDate?: Date;
  description: string;
}

export interface Education {
  institution: string;
  degree: string;
  fieldOfStudy: string;
  graduationDate: Date;
}

export interface Skill {
  name: string;
  level: number;
  category: string;
}

export interface Project {
  name: string;
  description: string;
  url?: string;
  imageUrl?: string;
  technologies: string[];
}

export interface Certification {
  name: string;
  issuingOrganization: string;
  issueDate: Date;
  expirationDate?: Date;
}

export interface CreatePortfolioRequest {
  title: string;
  subtitle: string;
  bio: string;
  template: string;
  isPublic: boolean;
  featuredBlogsEnabled: boolean;
  data?: PortfolioData;
}

@Injectable({
  providedIn: 'root'
})
export class PortfolioService {
  private readonly baseUrl = `${environment.apiUrl}/portfolios`;

  constructor(private http: HttpClient) {}

  getAll(): Observable<Portfolio[]> {
    return this.http.get<Portfolio[]>(this.baseUrl);
  }

  getById(id: string): Observable<Portfolio> {
    return this.http.get<Portfolio>(`${this.baseUrl}/${id}`);
  }

  getByUserId(userId: string): Observable<Portfolio> {
    return this.http.get<Portfolio>(`${this.baseUrl}/user/${userId}`);
  }

  create(portfolio: CreatePortfolioRequest): Observable<Portfolio> {
    return this.http.post<Portfolio>(this.baseUrl, portfolio);
  }

  update(id: string, portfolio: CreatePortfolioRequest): Observable<Portfolio> {
    return this.http.put<Portfolio>(`${this.baseUrl}/${id}`, { id, ...portfolio });
  }

  importFromLinkedIn(userId: string, linkedInData: any): Observable<Portfolio> {
    return this.http.post<Portfolio>(`${this.baseUrl}/import/linkedin`, {
      userId,
      linkedInData
    });
  }

  importFromResume(userId: string, resumeData: any): Observable<Portfolio> {
    return this.http.post<Portfolio>(`${this.baseUrl}/import/resume`, {
      userId,
      resumeData
    });
  }
}
```

---

## Example Components

### Login Component

`src/app/components/login/login.component.ts`:

```typescript
import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html'
})
export class LoginComponent {
  email = '';
  password = '';
  error = '';

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  login(): void {
    this.error = '';
    this.authService.login(this.email, this.password).subscribe({
      next: (result) => {
        if (result.success) {
          this.router.navigate(['/dashboard']);
        } else {
          this.error = result.error || 'Login failed';
        }
      },
      error: (err) => {
        this.error = 'An error occurred during login';
        console.error(err);
      }
    });
  }
}
```

`src/app/components/login/login.component.html`:

```html
<div class="login-container">
  <h2>Login</h2>
  <form (ngSubmit)="login()">
    <div>
      <label for="email">Email</label>
      <input type="email" id="email" [(ngModel)]="email" name="email" required>
    </div>
    <div>
      <label for="password">Password</label>
      <input type="password" id="password" [(ngModel)]="password" name="password" required>
    </div>
    <div *ngIf="error" class="error">{{ error }}</div>
    <button type="submit">Login</button>
  </form>
</div>
```

---

### Blog List Component

`src/app/components/blog-list/blog-list.component.ts`:

```typescript
import { Component, OnInit } from '@angular/core';
import { BlogService, Blog } from '../../services/blog.service';

@Component({
  selector: 'app-blog-list',
  templateUrl: './blog-list.component.html'
})
export class BlogListComponent implements OnInit {
  blogs: Blog[] = [];
  loading = false;
  error = '';

  constructor(private blogService: BlogService) {}

  ngOnInit(): void {
    this.loadBlogs();
  }

  loadBlogs(): void {
    this.loading = true;
    this.blogService.getAll(true).subscribe({
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

---

### Auth Guard

`src/app/guards/auth.guard.ts`:

```typescript
import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {
  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  canActivate(): boolean {
    if (this.authService.getToken()) {
      return true;
    }
    
    this.router.navigate(['/login']);
    return false;
  }
}
```

**Use in routes:**

```typescript
const routes: Routes = [
  { path: 'login', component: LoginComponent },
  { 
    path: 'dashboard', 
    component: DashboardComponent,
    canActivate: [AuthGuard]
  },
  { 
    path: 'blogs', 
    component: BlogListComponent,
    canActivate: [AuthGuard]
  }
];
```

---

## Error Handling

Create a global error handler:

`src/app/services/error-handler.service.ts`:

```typescript
import { Injectable } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class ErrorHandlerService {
  handleError(error: HttpErrorResponse): string {
    if (error.status === 0) {
      return 'Unable to connect to server';
    } else if (error.status === 400) {
      return this.extractValidationErrors(error);
    } else if (error.status === 401) {
      return 'Unauthorized - please login';
    } else if (error.status === 404) {
      return 'Resource not found';
    } else if (error.status === 500) {
      return 'Server error occurred';
    }
    return 'An unexpected error occurred';
  }

  private extractValidationErrors(error: HttpErrorResponse): string {
    if (error.error?.errors) {
      const messages = Object.values(error.error.errors).flat();
      return messages.join(', ');
    }
    return error.error?.detail || 'Validation failed';
  }
}
```

---

## Testing

### Service Unit Test Example

`src/app/services/blog.service.spec.ts`:

```typescript
import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { BlogService, Blog } from './blog.service';
import { environment } from '../../environments/environment';

describe('BlogService', () => {
  let service: BlogService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [BlogService]
    });
    service = TestBed.inject(BlogService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should fetch all blogs', () => {
    const mockBlogs: Blog[] = [
      {
        id: '1',
        title: 'Test Blog',
        slug: 'test-blog',
        content: 'Content',
        summary: 'Summary',
        isPublished: true,
        authorId: 'author1',
        tags: ['test'],
        views: 0,
        createdAt: new Date()
      }
    ];

    service.getAll(true).subscribe(blogs => {
      expect(blogs.length).toBe(1);
      expect(blogs[0].title).toBe('Test Blog');
    });

    const req = httpMock.expectOne(`${environment.apiUrl}/blogs?publishedOnly=true&page=1&pageSize=10`);
    expect(req.request.method).toBe('GET');
    req.flush(mockBlogs);
  });
});
```

---

## Next Steps

1. **State Management**: Consider NgRx or Akita for complex state
2. **Real-time Updates**: Integrate WebSockets for live blog updates
3. **Caching**: Implement HTTP caching strategies
4. **Offline Support**: Add PWA capabilities with service workers
5. **File Upload**: Add resume upload functionality with FormData

## Additional Resources

- [Angular HTTP Client Guide](https://angular.io/guide/http)
- [RxJS Documentation](https://rxjs.dev/)
- [Angular Router](https://angular.io/guide/router)
