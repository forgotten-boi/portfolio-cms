import { Routes } from '@angular/router';
import { authGuard } from './guards/auth.guard';

export const routes: Routes = [
  {
    path: 'login',
    loadComponent: () => import('./components/login/login.component').then(m => m.LoginComponent)
  },
  {
    path: 'dashboard',
    loadComponent: () => import('./components/dashboard/dashboard.component').then(m => m.DashboardComponent),
    canActivate: [authGuard]
  },
  {
    path: 'tenants',
    loadComponent: () => import('./components/tenants/tenants.component').then(m => m.TenantsComponent),
    canActivate: [authGuard]
  },
  {
    path: 'users',
    loadComponent: () => import('./components/users/users.component').then(m => m.UsersComponent),
    canActivate: [authGuard]
  },
  {
    path: 'blogs',
    loadComponent: () => import('./components/blogs/blogs.component').then(m => m.BlogsComponent),
    canActivate: [authGuard]
  },
  {
    path: 'blogs/new',
    loadComponent: () => import('./components/blog-form/blog-form.component').then(m => m.BlogFormComponent),
    canActivate: [authGuard]
  },
  {
    path: 'blogs/edit/:id',
    loadComponent: () => import('./components/blog-form/blog-form.component').then(m => m.BlogFormComponent),
    canActivate: [authGuard]
  },
  {
    path: 'portfolios',
    loadComponent: () => import('./components/portfolios/portfolios.component').then(m => m.PortfoliosComponent),
    canActivate: [authGuard]
  },
  {
    path: 'portfolios/new',
    loadComponent: () => import('./components/portfolio-form/portfolio-form.component').then(m => m.PortfolioFormComponent),
    canActivate: [authGuard]
  },
  {
    path: 'portfolios/edit/:id',
    loadComponent: () => import('./components/portfolio-form/portfolio-form.component').then(m => m.PortfolioFormComponent),
    canActivate: [authGuard]
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
