import { HttpInterceptorFn, HttpRequest, HttpHandlerFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';
import { AuthService } from '../services/auth.service';
import { environment } from '../../environments/environment';

export const authInterceptor: HttpInterceptorFn = (req: HttpRequest<unknown>, next: HttpHandlerFn) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  const token = authService.getToken();
  const tenantId = authService.getTenantId() || environment.tenantId;

  let clonedRequest = req.clone({
    setHeaders: tenantId ? {
      'X-Tenant-Id': tenantId
    } : {}
  });

  if (token) {
    clonedRequest = clonedRequest.clone({
      setHeaders: {
        'Authorization': `Bearer ${token}`,
        'X-Tenant-Id': tenantId || ''
      }
    });
  }

  return next(clonedRequest).pipe(
    catchError((error) => {
      if (error.status === 401) {
        authService.logout();
        router.navigate(['/login']);
      }
      return throwError(() => error);
    })
  );
};
