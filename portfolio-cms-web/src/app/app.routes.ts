import { Routes } from '@angular/router';
import { authGuard } from './guards/auth.guard';

export const routes: Routes = [
  {
    path: 'login',
    loadComponent: () => import('./components/login/login.component').then(m => m.LoginComponent)
  },
  {
    path: 'register',
    loadComponent: () => import('./components/registration/registration.component').then(m => m.RegistrationComponent)
  },
  {
    path: 'dashboard',
    canActivate: [authGuard],
    children: [
      {
        path: '',
        loadComponent: () => import('./components/dashboard/dashboard.component').then(m => m.DashboardComponent)
      },
      {
        path: 'tenants',
        loadComponent: () => import('./components/tenants/tenants.component').then(m => m.TenantsComponent)
      },
      {
        path: 'users',
        loadComponent: () => import('./components/users/users.component').then(m => m.UsersComponent)
      },
      {
        path: 'blogs',
        loadComponent: () => import('./components/blogs/blogs.component').then(m => m.BlogsComponent)
      },
      {
        path: 'blogs/new',
        loadComponent: () => import('./components/blog-form/blog-form.component').then(m => m.BlogFormComponent)
      },
      {
        path: 'blogs/edit/:id',
        loadComponent: () => import('./components/blog-form/blog-form.component').then(m => m.BlogFormComponent)
      },
      {
        path: 'portfolios',
        loadComponent: () => import('./components/portfolios/portfolios.component').then(m => m.PortfoliosComponent)
      },
      {
        path: 'portfolios/new',
        loadComponent: () => import('./components/portfolio-form/portfolio-form.component').then(m => m.PortfolioFormComponent)
      },
      {
        path: 'portfolios/edit/:id',
        loadComponent: () => import('./components/portfolio-form/portfolio-form.component').then(m => m.PortfolioFormComponent)
      }
    ]
  },
  {
    path: 'portfolio/:slug',
    loadComponent: () => import('./components/public-portfolio/public-portfolio.component').then(m => m.PublicPortfolioComponent)
  },
  {
    path: 'blog/:slug',
    loadComponent: () => import('./components/public-blog/public-blog.component').then(m => m.PublicBlogComponent)
  },
  {
    path: '',
    redirectTo: '/dashboard',
    pathMatch: 'full'
  },
  {
    path: '**',
    redirectTo: '/dashboard'
  }
];
