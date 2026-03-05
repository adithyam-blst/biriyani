import { HttpInterceptorFn, HttpRequest, HttpHandlerFn, HttpEvent, HttpResponse } from '@angular/common/http';
import { Observable, of, delay } from 'rxjs';

/**
 * Mock Backend Interceptor
 * 
 * This interceptor simulates a backend API for development purposes.
 * It intercepts requests to /api/* and returns mock responses.
 * 
 * To use: Add it to the withInterceptors array in app.config.ts
 * Note: Remove or disable this in production.
 */
export const mockBackendInterceptor: HttpInterceptorFn = (
  req: HttpRequest<unknown>,
  next: HttpHandlerFn
): Observable<HttpEvent<unknown>> => {
  // Only intercept API requests
  if (!req.url.startsWith('/api/')) {
    return next(req);
  }

  // Mock login endpoint
  if (req.url === '/api/auth/login' && req.method === 'POST') {
    const body = req.body as { username: string; password: string };
    
    // Simulate validation
    if (body?.username && body?.password && body.password.length >= 6) {
      // Return mock successful response
      return of(new HttpResponse({
        status: 200,
        body: {
          token: 'mock_jwt_token_' + Date.now(),
          message: 'Login successful'
        }
      })).pipe(delay(500)); // Simulate network delay
    } else {
      // Return error response
      return of(new HttpResponse({
        status: 401,
        body: {
          message: 'Invalid credentials'
        }
      })).pipe(delay(500));
    }
  }

  // Default: pass through (or return 404 for unimplemented endpoints)
  return of(new HttpResponse({
    status: 404,
    body: {
      message: 'API endpoint not implemented in mock backend'
    }
  })).pipe(delay(100));
};
