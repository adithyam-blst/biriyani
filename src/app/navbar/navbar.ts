import { Component, OnInit, signal } from '@angular/core';
import { RouterModule, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [RouterModule, CommonModule],
  templateUrl: './navbar.html',
  styleUrl: './navbar.css',
})
export class Navbar implements OnInit {
  isLoggedIn = signal(false);
  employeeId = signal<string | null>(null);

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    // Check auth status on init
    this.updateAuthStatus();
    
    // Subscribe to auth changes
    this.authService.isAuthenticated$.subscribe((isAuth) => {
      this.isLoggedIn.set(isAuth);
      if (isAuth) {
        this.employeeId.set(this.authService.getEmployeeId());
      } else {
        this.employeeId.set(null);
      }
    });
  }

  updateAuthStatus(): void {
    const isAuth = this.authService.isLoggedIn();
    this.isLoggedIn.set(isAuth);
    if (isAuth) {
      this.employeeId.set(this.authService.getEmployeeId());
    }
  }

  logout(): void {
    this.authService.logout();
    this.isLoggedIn.set(false);
    this.employeeId.set(null);
    this.router.navigate(['/']);
  }

  isBiriyaniFriday(): boolean {
    const today = new Date();
    return today.getDay() === 5; // Friday is 5
  }
}
