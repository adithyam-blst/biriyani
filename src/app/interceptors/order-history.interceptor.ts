import { HttpInterceptorFn, HttpRequest, HttpHandlerFn, HttpEvent, HttpResponse } from '@angular/common/http';
import { Observable, of, delay, switchMap } from 'rxjs';
import { inject } from '@angular/core';
import { AuthService } from '../services/auth.service';

/**
 * Order History Interceptor
 * 
 * This interceptor handles order history functionality by:
 * 1. Automatically appending employee ID to order history requests
 * 2. Caching order history data to reduce API calls
 * 3. Providing mock order history for development if needed
 * 
 * Endpoints handled:
 * - GET /api/orders/history - Returns order history for the authenticated employee
 * - GET /api/orders/:orderId - Returns specific order details
 * 
 * Usage: Add to the withInterceptors array in app.config.ts after authUserInterceptor
 */

// Simple in-memory cache for order history
const orderHistoryCache = new Map<string, { data: any; timestamp: number }>();
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

export const orderHistoryInterceptor: HttpInterceptorFn = (
  req: HttpRequest<unknown>,
  next: HttpHandlerFn
): Observable<HttpEvent<unknown>> => {
  const authService = inject(AuthService);
  const employeeId = authService.getEmployeeId();

  // Handle order history endpoint
  if (req.url.includes('/api/orders/history') && req.method === 'GET') {
    
    // Add employee ID as query parameter if not present
    if (employeeId && !req.url.includes('employeeId=')) {
      const separator = req.url.includes('?') ? '&' : '?';
      req = req.clone({
        url: `${req.url}${separator}employeeId=${employeeId}`
      });
    }

    // Check cache first (for GET requests only)
    const cacheKey = `orders_${employeeId}`;
    const cached = orderHistoryCache.get(cacheKey);
    
    if (cached && (Date.now() - cached.timestamp) < CACHE_TTL) {
      console.log('[OrderHistoryInterceptor] Returning cached order history');
      return of(new HttpResponse({
        status: 200,
        body: cached.data
      })).pipe(delay(100));
    }

    // Let the request proceed and cache the response
    return next(req).pipe(
      switchMap(event => {
        if (event instanceof HttpResponse && event.status === 200) {
          // Cache the successful response
          orderHistoryCache.set(cacheKey, {
            data: event.body,
            timestamp: Date.now()
          });
        }
        return of(event);
      })
    );
  }

  // Handle specific order details endpoint
  if (req.url.match(/\/api\/orders\/[^/]+$/) && req.method === 'GET') {
    // Add employee ID to headers for authorization check
    if (employeeId) {
      req = req.clone({
        setHeaders: {
          'X-Employee-Id': employeeId
        }
      });
    }
  }

  // Handle order creation - ensure employee ID is included
  if (req.url.includes('/api/orders') && req.method === 'POST') {
    const body = req.body as any;
    if (employeeId && body && !body.employeeId) {
      req = req.clone({
        body: { ...body, employeeId }
      });
    }
  }

  return next(req);
};

/**
 * Clear the order history cache
 * Call this when user logs out or when you want to refresh the data
 */
export function clearOrderHistoryCache(): void {
  orderHistoryCache.clear();
  console.log('[OrderHistoryInterceptor] Cache cleared');
}

/**
 * Clear cache for a specific employee
 */
export function clearEmployeeOrderCache(employeeId: string): void {
  const cacheKey = `orders_${employeeId}`;
  orderHistoryCache.delete(cacheKey);
}
