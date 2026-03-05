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
    const body = req.body as { employeeId: string; password: string };
    
    // Simulate validation
    if (body?.employeeId && body?.password && body.password.length >= 6) {
      // Return mock successful response
      return of(new HttpResponse({
        status: 200,
        body: {
          token: 'mock_jwt_token_' + Date.now(),
          employeeId: body.employeeId,
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

  // Mock order history endpoint
  if (req.url.includes('/api/orders/history') && req.method === 'GET') {
    const employeeId = req.headers.get('X-Employee-Id') || 'unknown';
    
    // Return mock order history for the employee
    return of(new HttpResponse({
      status: 200,
      body: {
        employeeId: employeeId,
        orders: [
          {
            orderId: 'ORD-001',
            date: '2024-03-01',
            item: 'Chicken Biriyani',
            quantity: 2,
            total: 300,
            status: 'Delivered'
          },
          {
            orderId: 'ORD-002',
            date: '2024-02-28',
            item: 'Mutton Biriyani',
            quantity: 1,
            total: 250,
            status: 'Delivered'
          },
          {
            orderId: 'ORD-003',
            date: '2024-02-25',
            item: 'Veg Biriyani',
            quantity: 3,
            total: 450,
            status: 'Cancelled'
          }
        ]
      }
    })).pipe(delay(300));
  }

  // Default: pass through (or return 404 for unimplemented endpoints)
  return of(new HttpResponse({
    status: 404,
    body: {
      message: 'API endpoint not implemented in mock backend'
    }
  })).pipe(delay(100));
};
