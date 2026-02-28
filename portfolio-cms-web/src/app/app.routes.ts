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
      },
      {
        path: 'settings',
        loadComponent: () => import('./components/settings/settings.component').then(m => m.SettingsComponent)
      },
      {
        path: 'cv-manager',
        loadComponent: () => import('./components/cv-manager/cv-manager.component').then(m => m.CvManagerComponent)
      },
      {
        path: 'job-matcher',
        loadComponent: () => import('./components/job-matcher/job-matcher.component').then(m => m.JobMatcherComponent)
      },
      {
        path: 'resume-generator',
        loadComponent: () => import('./components/resume-generator/resume-generator.component').then(m => m.ResumeGeneratorComponent)
      },
      {
        path: 'analytics',
        loadComponent: () => import('./components/analytics/analytics.component').then(m => m.AnalyticsComponent)
      },
      {
        path: 'portfolio-manager',
        loadComponent: () => import('./components/portfolio-manager/portfolio-manager.component').then(m => m.PortfolioManagerComponent)
      },
      // ── Payment & Event-Driven Architecture ──
      {
        path: 'payments',
        loadComponent: () => import('./components/payment-dashboard/payment-dashboard.component').then(m => m.PaymentDashboardComponent)
      },
      {
        path: 'payments/orders',
        loadComponent: () => import('./components/payment-orders/payment-orders.component').then(m => m.PaymentOrdersComponent)
      },
      {
        path: 'payments/orders/new',
        loadComponent: () => import('./components/create-payment-order/create-payment-order.component').then(m => m.CreatePaymentOrderComponent)
      },
      {
        path: 'payments/orders/:id',
        loadComponent: () => import('./components/payment-order-detail/payment-order-detail.component').then(m => m.PaymentOrderDetailComponent)
      },
      {
        path: 'payments/accounting',
        loadComponent: () => import('./components/payment-accounting/payment-accounting.component').then(m => m.PaymentAccountingComponent)
      },
      {
        path: 'payments/lifecycle',
        loadComponent: () => import('./components/payment-lifecycle/payment-lifecycle.component').then(m => m.PaymentLifecycleComponent)
      },
      {
        path: 'event-analytics',
        loadComponent: () => import('./components/event-analytics-dashboard/event-analytics-dashboard.component').then(m => m.EventAnalyticsDashboardComponent)
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
