import { HttpInterceptorFn, HttpRequest, HttpHandlerFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { AuthService } from '../services/auth.service';

/**
 * Auth User Interceptor
 * 
 * This interceptor attaches the JWT token and employee ID to the headers
 * for all API requests after login. It retrieves the employee ID from
 * localStorage where it was stored during the login process.
 * 
 * Usage: Add to the withInterceptors array in app.config.ts
 * Order matters - add this after any mock backend but before the request goes out
 */
export const authUserInterceptor: HttpInterceptorFn = (
  req: HttpRequest<unknown>,
  next: HttpHandlerFn
) => {
  const authService = inject(AuthService);
  
  // Skip adding headers for login requests (no token needed)
  if (req.url.includes('/auth/login')) {
    return next(req);
  }

  const token = authService.getToken();
  
  // Only modify request if we have a token
  if (token) {
    // Retrieve employee ID from localStorage (set during login)
    const employeeId = authService.getEmployeeId() || '';
    
    // Clone the request and add headers
    req = req.clone({
      setHeaders: {
        'Authorization': `Bearer ${token}`,
        'X-Employee-Id': employeeId,
        'X-User-Id': employeeId // Alternative header name for broader compatibility
      }
    });
  }

  return next(req);
};
