import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './home.html',
  styleUrl: './home.css',
})
export class Home {
  features = [
    {
      icon: '🍛',
      title: 'Authentic Biriyani',
      description: 'Choose from our selection of authentic biriyanis prepared with traditional recipes'
    },
    {
      icon: '📅',
      title: 'Biriyani Friday',
      description: 'Special biriyani delivery every Friday right to your desk'
    },
    {
      icon: '🚀',
      title: 'Quick Ordering',
      description: 'Easy and fast ordering process with just a few clicks'
    },
    {
      icon: '📱',
      title: 'Track Orders',
      description: 'Real-time tracking of your order from kitchen to delivery'
    }
  ];

  howItWorks = [
    {
      step: '1',
      icon: '🔑',
      title: 'Login',
      description: 'Login with your employee ID to access the ordering system'
    },
    {
      step: '2',
      icon: '🍛',
      title: 'Choose',
      description: 'Browse our menu and select your favorite biriyani'
    },
    {
      step: '3',
      icon: '🛒',
      title: 'Order',
      description: 'Add to cart and place your order with special instructions'
    },
    {
      step: '4',
      icon: '🎉',
      title: 'Enjoy',
      description: 'Receive your biriyani and enjoy the delicious meal!'
    }
  ];

  isBiriyaniFriday = signal(false);
  nextFriday = signal<Date | null>(null);

  constructor(private router: Router) {
    this.checkDay();
  }

  checkDay(): void {
    const today = new Date();
    this.isBiriyaniFriday.set(today.getDay() === 5);
    
    // Calculate next Friday
    const nextFriday = new Date(today);
    const daysUntilFriday = (5 - today.getDay() + 7) % 7;
    nextFriday.setDate(today.getDate() + (daysUntilFriday === 0 ? 7 : daysUntilFriday));
    this.nextFriday.set(nextFriday);
  }

  navigateToLogin(): void {
    this.router.navigate(['/Login']);
  }
}
