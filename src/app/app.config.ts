import { ApplicationConfig, provideBrowserGlobalErrorListeners } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient, withInterceptors } from '@angular/common/http';

import { routes } from './app.routes';
import { authInterceptor } from './interceptors/auth.interceptor';
import { authUserInterceptor } from './interceptors/auth-user.interceptor';
import { orderHistoryInterceptor } from './interceptors/order-history.interceptor';
// Uncomment the line below to use mock backend for development (no real API needed)
// import { mockBackendInterceptor } from './interceptors/mock-backend.interceptor';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideRouter(routes),
    // Interceptor order matters:
    // 1. mockBackendInterceptor (if using) - intercepts and returns mock responses
    // 2. authUserInterceptor - adds JWT token and employee ID to request headers
    // 3. orderHistoryInterceptor - handles order history API calls with caching
    // 4. authInterceptor - legacy interceptor (can be removed if using authUserInterceptor)
    //
    // For development with mock backend:
    // provideHttpClient(withInterceptors([mockBackendInterceptor, authUserInterceptor, orderHistoryInterceptor]))
    //
    // For production with real backend:
    provideHttpClient(withInterceptors([authUserInterceptor, orderHistoryInterceptor]))
  ]
};
