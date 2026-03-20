import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { OrderService, Order } from '../../services/order.service';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-history',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './history.html',
  styleUrl: './history.css'
})
export class History implements OnInit {
  orders = signal<Order[]>([]);
  isLoading = signal(true);
  error = signal('');
  selectedOrder = signal<Order | null>(null);
  showDetails = signal(false);
  filterStatus = signal<'all' | 'pending' | 'preparing' | 'ready' | 'delivered' | 'cancelled'>('all');
  
  // Computed filtered orders
  filteredOrders = () => {
    if (this.filterStatus() === 'all') {
      return this.orders();
    }
    return this.orders().filter(order => order.status === this.filterStatus());
  };

  // Status counts
  statusCounts = () => {
    const counts = {
      all: this.orders().length,
      pending: 0,
      preparing: 0,
      ready: 0,
      delivered: 0,
      cancelled: 0
    };
    
    this.orders().forEach(order => {
      if (counts[order.status] !== undefined) {
        counts[order.status]++;
      }
    });
    
    return counts;
  };

  constructor(
    private orderService: OrderService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.loadOrderHistory();
  }

  loadOrderHistory(): void {
    this.isLoading.set(true);
    this.error.set('');

    this.orderService.getOrderHistory().subscribe({
      next: (orders) => {
        // Sort by date, newest first
        const sortedOrders = orders.sort((a, b) => 
          new Date(b.orderDate).getTime() - new Date(a.orderDate).getTime()
        );
        this.orders.set(sortedOrders);
        this.isLoading.set(false);
      },
      error: (err) => {
        console.error('Error loading order history:', err);
        this.error.set('Failed to load order history. Please try again later.');
        this.isLoading.set(false);
      }
    });
  }

  setFilter(status: 'all' | 'pending' | 'preparing' | 'ready' | 'delivered' | 'cancelled'): void {
    this.filterStatus.set(status);
  }

  showOrderDetails(order: Order): void {
    this.selectedOrder.set(order);
    this.showDetails.set(true);
  }

  closeDetails(): void {
    this.showDetails.set(false);
    setTimeout(() => {
      this.selectedOrder.set(null);
    }, 300);
  }

  cancelOrder(order: Order, event: Event): void {
    event.stopPropagation();
    
    if (!confirm('Are you sure you want to cancel this order?')) {
      return;
    }

    if (order.orderId) {
      this.orderService.cancelOrder(order.orderId).subscribe({
        next: () => {
          // Update the order status locally
          this.orders.update(orders => 
            orders.map(o => 
              o.orderId === order.orderId 
                ? { ...o, status: 'cancelled' as const }
                : o
            )
          );
        },
        error: (err) => {
          console.error('Error cancelling order:', err);
          alert('Failed to cancel order. Please try again.');
        }
      });
    }
  }

  getStatusColor(status: string): string {
    return this.orderService.getStatusColor(status);
  }

  getStatusLabel(status: string): string {
    return this.orderService.getStatusLabel(status);
  }

  getStatusIcon(status: string): string {
    const icons: { [key: string]: string } = {
      'pending': '⏳',
      'preparing': '👨‍🍳',
      'ready': '✅',
      'delivered': '🎉',
      'cancelled': '❌'
    };
    return icons[status] || '📦';
  }

  formatDate(dateString: string): string {
    const date = new Date(dateString);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (date.toDateString() === today.toDateString()) {
      return 'Today, ' + date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
    } else if (date.toDateString() === yesterday.toDateString()) {
      return 'Yesterday, ' + date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
    } else {
      return date.toLocaleDateString('en-US', { 
        weekday: 'short', 
        year: 'numeric', 
        month: 'short', 
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    }
  }

  formatDeliveryDate(dateString: string): string {
    const date = new Date(dateString);
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    if (date.toDateString() === today.toDateString()) {
      return 'Today';
    } else if (date.toDateString() === tomorrow.toDateString()) {
      return 'Tomorrow';
    } else {
      return date.toLocaleDateString('en-US', { 
        weekday: 'long', 
        month: 'short', 
        day: 'numeric' 
      });
    }
  }

  getProgressPercentage(status: string): number {
    const progress: { [key: string]: number } = {
      'pending': 25,
      'preparing': 50,
      'ready': 75,
      'delivered': 100,
      'cancelled': 0
    };
    return progress[status] || 0;
  }

  canCancel(status: string): boolean {
    return ['pending', 'preparing'].includes(status);
  }
}
