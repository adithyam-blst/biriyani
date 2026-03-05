import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, tap, catchError, throwError } from 'rxjs';

interface LoginResponse {
  token: string;
}

interface LoginCredentials {
  username: string;
  password: string;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private readonly TOKEN_KEY = 'biriyani_jwt_token';
  private readonly EXPIRY_KEY = 'biriyani_token_expiry';
  private readonly API_BASE_URL = '/api'; // Configurable base URL
  
  private isAuthenticatedSubject = new BehaviorSubject<boolean>(this.hasValidToken());
  public isAuthenticated$ = this.isAuthenticatedSubject.asObservable();

  constructor(private http: HttpClient) {}

  login(credentials: LoginCredentials): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(`${this.API_BASE_URL}/auth/login`, credentials).pipe(
      catchError(error => {
        console.error('AuthService login error:', error);
        return throwError(() => error);
      }),
      tap(response => {
        this.setToken(response.token);
        this.isAuthenticatedSubject.next(true);
      })
    );
  }

  logout(): void {
    localStorage.removeItem(this.TOKEN_KEY);
    localStorage.removeItem(this.EXPIRY_KEY);
    this.isAuthenticatedSubject.next(false);
  }

  private setToken(token: string): void {
    // Store token with 1 hour expiration
    const expiryTime = new Date().getTime() + (60 * 60 * 1000); // 1 hour in milliseconds
    localStorage.setItem(this.TOKEN_KEY, token);
    localStorage.setItem(this.EXPIRY_KEY, expiryTime.toString());
  }

  getToken(): string | null {
    if (this.hasValidToken()) {
      return localStorage.getItem(this.TOKEN_KEY);
    }
    this.logout();
    return null;
  }

  private hasValidToken(): boolean {
    const token = localStorage.getItem(this.TOKEN_KEY);
    const expiry = localStorage.getItem(this.EXPIRY_KEY);
    
    if (!token || !expiry) {
      return false;
    }

    const expiryTime = parseInt(expiry, 10);
    const currentTime = new Date().getTime();
    
    return currentTime < expiryTime;
  }

  isLoggedIn(): boolean {
    return this.hasValidToken();
  }
}
