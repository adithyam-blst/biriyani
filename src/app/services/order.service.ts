import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, catchError, throwError } from 'rxjs';
import { AuthService } from './auth.service';

export interface BiriyaniType {
  id: string;
  name: string;
  description: string;
  price: number;
  image: string;
  category: 'veg' | 'non-veg';
  spiceLevel: 'mild' | 'medium' | 'hot';
  isAvailable: boolean;
}

export interface OrderItem {
  biriyaniId: string;
  name: string;
  quantity: number;
  price: number;
  spiceLevel: string;
}

export interface Order {
  orderId?: string;
  employeeId: string;
  employeeName?: string;
  items: OrderItem[];
  totalAmount: number;
  orderDate: string;
  deliveryDate: string;
  status: 'pending' | 'preparing' | 'ready' | 'delivered' | 'cancelled';
  specialInstructions?: string;
  deliveryLocation?: string;
}

@Injectable({
  providedIn: 'root'
})
export class OrderService {
  private readonly API_BASE_URL = '/api';

  constructor(
    private http: HttpClient,
    private authService: AuthService
  ) {}

  /**
   * Get all available biriyani types
   */
  getBiriyaniTypes(): Observable<BiriyaniType[]> {
    return this.http.get<BiriyaniType[]>(`${this.API_BASE_URL}/biriyanis`).pipe(
      catchError(error => {
        console.error('Error fetching biriyani types:', error);
        return throwError(() => error);
      })
    );
  }

  /**
   * Place a new order
   */
  placeOrder(order: Partial<Order>): Observable<Order> {
    const employeeId = this.authService.getEmployeeId();
    if (!employeeId) {
      return throwError(() => new Error('User not authenticated'));
    }

    const orderData: Order = {
      ...order as Order,
      employeeId,
      orderDate: new Date().toISOString(),
      status: 'pending'
    };

    return this.http.post<Order>(`${this.API_BASE_URL}/orders`, orderData).pipe(
      catchError(error => {
        console.error('Error placing order:', error);
        return throwError(() => error);
      })
    );
  }

  /**
   * Get order history for the current employee
   */
  getOrderHistory(): Observable<Order[]> {
    const employeeId = this.authService.getEmployeeId();
    if (!employeeId) {
      return throwError(() => new Error('User not authenticated'));
    }

    return this.http.get<Order[]>(`${this.API_BASE_URL}/orders/history`).pipe(
      catchError(error => {
        console.error('Error fetching order history:', error);
        return throwError(() => error);
      })
    );
  }

  /**
   * Get specific order details
   */
  getOrderDetails(orderId: string): Observable<Order> {
    return this.http.get<Order>(`${this.API_BASE_URL}/orders/${orderId}`).pipe(
      catchError(error => {
        console.error('Error fetching order details:', error);
        return throwError(() => error);
      })
    );
  }

  /**
   * Cancel an order
   */
  cancelOrder(orderId: string): Observable<void> {
    return this.http.post<void>(`${this.API_BASE_URL}/orders/${orderId}/cancel`, {}).pipe(
      catchError(error => {
        console.error('Error cancelling order:', error);
        return throwError(() => error);
      })
    );
  }

  /**
   * Check if it's Friday (Biriyani Friday!)
   */
  isBiriyaniFriday(): boolean {
    const today = new Date();
    return today.getDay() === 5; // 5 is Friday
  }

  /**
   * Get next Friday date
   */
  getNextFriday(): Date {
    const today = new Date();
    const nextFriday = new Date(today);
    const daysUntilFriday = (5 - today.getDay() + 7) % 7;
    nextFriday.setDate(today.getDate() + (daysUntilFriday === 0 ? 7 : daysUntilFriday));
    return nextFriday;
  }

  /**
   * Get status color for UI
   */
  getStatusColor(status: string): string {
    const colors: { [key: string]: string } = {
      'pending': '#f59e0b',
      'preparing': '#3b82f6',
      'ready': '#8b5cf6',
      'delivered': '#10b981',
      'cancelled': '#ef4444'
    };
    return colors[status] || '#6b7280';
  }

  /**
   * Get status label for UI
   */
  getStatusLabel(status: string): string {
    const labels: { [key: string]: string } = {
      'pending': '⏳ Pending',
      'preparing': '👨‍🍳 Preparing',
      'ready': '✅ Ready for Pickup',
      'delivered': '🎉 Delivered',
      'cancelled': '❌ Cancelled'
    };
    return labels[status] || status;
  }
}
