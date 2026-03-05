import { ApplicationConfig, provideBrowserGlobalErrorListeners } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient, withInterceptors } from '@angular/common/http';

import { routes } from './app.routes';
import { authInterceptor } from './interceptors/auth.interceptor';
// Uncomment the line below to use mock backend for development (no real API needed)
// import { mockBackendInterceptor } from './interceptors/mock-backend.interceptor';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideRouter(routes),
    // Add mockBackendInterceptor before authInterceptor when using mock backend:
    // provideHttpClient(withInterceptors([mockBackendInterceptor, authInterceptor]))
    provideHttpClient(withInterceptors([authInterceptor]))
  ]
};
