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

// Mock biriyani data
const biriyanis = [
  {
    id: 'chicken-1',
    name: 'Chicken Dum Biriyani',
    description: 'Aromatic basmati rice cooked with tender chicken pieces, saffron, and traditional spices',
    price: 180,
    image: '🍗',
    category: 'non-veg',
    spiceLevel: 'medium',
    isAvailable: true
  },
  {
    id: 'mutton-1',
    name: 'Mutton Biriyani',
    description: 'Succulent mutton pieces slow-cooked with fragrant rice and authentic Hyderabadi spices',
    price: 250,
    image: '🥩',
    category: 'non-veg',
    spiceLevel: 'hot',
    isAvailable: true
  },
  {
    id: 'veg-1',
    name: 'Veg Dum Biriyani',
    description: 'Fresh vegetables and paneer layered with aromatic basmati rice and mild spices',
    price: 150,
    image: '🥬',
    category: 'veg',
    spiceLevel: 'mild',
    isAvailable: true
  },
  {
    id: 'egg-1',
    name: 'Egg Biriyani',
    description: 'Boiled eggs nestled in spiced rice with caramelized onions and herbs',
    price: 140,
    image: '🥚',
    category: 'non-veg',
    spiceLevel: 'medium',
    isAvailable: true
  },
  {
    id: 'prawn-1',
    name: 'Prawn Biriyani',
    description: 'Fresh prawns marinated in spices and cooked with fragrant basmati rice',
    price: 280,
    image: '🦐',
    category: 'non-veg',
    spiceLevel: 'hot',
    isAvailable: true
  },
  {
    id: 'mushroom-1',
    name: 'Mushroom Biriyani',
    description: 'Button mushrooms cooked with rice, cashews, and aromatic whole spices',
    price: 160,
    image: '🍄',
    category: 'veg',
    spiceLevel: 'medium',
    isAvailable: true
  }
];

// In-memory orders storage
let orders: any[] = [
  {
    orderId: 'ORD-001',
    employeeId: 'EMP001',
    items: [
      { biriyaniId: 'chicken-1', name: 'Chicken Dum Biriyani', quantity: 2, price: 180, spiceLevel: 'medium' }
    ],
    totalAmount: 360,
    orderDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
    deliveryDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
    status: 'delivered',
    deliveryLocation: 'Office Desk'
  },
  {
    orderId: 'ORD-002',
    employeeId: 'EMP001',
    items: [
      { biriyaniId: 'mutton-1', name: 'Mutton Biriyani', quantity: 1, price: 250, spiceLevel: 'hot' }
    ],
    totalAmount: 250,
    orderDate: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString(),
    deliveryDate: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString(),
    status: 'delivered',
    deliveryLocation: 'Conference Room'
  },
  {
    orderId: 'ORD-003',
    employeeId: 'EMP001',
    items: [
      { biriyaniId: 'veg-1', name: 'Veg Dum Biriyani', quantity: 3, price: 150, spiceLevel: 'mild' }
    ],
    totalAmount: 450,
    orderDate: new Date(Date.now() - 21 * 24 * 60 * 60 * 1000).toISOString(),
    deliveryDate: new Date(Date.now() - 21 * 24 * 60 * 60 * 1000).toISOString(),
    status: 'cancelled',
    deliveryLocation: 'Office Desk'
  }
];

let orderCounter = 4;

export const mockBackendInterceptor: HttpInterceptorFn = (
  req: HttpRequest<unknown>,
  next: HttpHandlerFn
): Observable<HttpEvent<unknown>> => {
  // Only intercept API requests
  if (!req.url.startsWith('/api/')) {
    return next(req);
  }

  console.log('[MockBackend] Intercepted:', req.method, req.url);

  // Mock login endpoint
  if (req.url === '/api/auth/login' && req.method === 'POST') {
    const body = req.body as { employeeId: string; password: string };
    
    // Simulate validation - accept any employee ID with password >= 6 chars
    if (body?.employeeId && body?.password && body.password.length >= 6) {
      return of(new HttpResponse({
        status: 200,
        body: {
          token: 'mock_jwt_token_' + Date.now(),
          employeeId: body.employeeId,
          message: 'Login successful'
        }
      })).pipe(delay(500));
    } else {
      return of(new HttpResponse({
        status: 401,
        body: {
          message: 'Invalid credentials'
        }
      })).pipe(delay(500));
    }
  }

  // Mock biriyani types endpoint
  if (req.url === '/api/biriyanis' && req.method === 'GET') {
    return of(new HttpResponse({
      status: 200,
      body: biriyanis
    })).pipe(delay(300));
  }

  // Mock order placement endpoint
  if (req.url === '/api/orders' && req.method === 'POST') {
    const body = req.body as any;
    const employeeId = req.headers.get('X-Employee-Id') || 'unknown';
    
    const newOrder = {
      orderId: `ORD-${String(orderCounter).padStart(3, '0')}`,
      employeeId: body.employeeId || employeeId,
      items: body.items,
      totalAmount: body.totalAmount,
      orderDate: new Date().toISOString(),
      deliveryDate: body.deliveryDate || new Date().toISOString(),
      status: 'pending',
      specialInstructions: body.specialInstructions,
      deliveryLocation: body.deliveryLocation || 'Office Desk'
    };
    
    orders.unshift(newOrder);
    orderCounter++;
    
    return of(new HttpResponse({
      status: 201,
      body: newOrder
    })).pipe(delay(500));
  }

  // Mock order history endpoint
  if (req.url.includes('/api/orders/history') && req.method === 'GET') {
    const employeeId = req.headers.get('X-Employee-Id') || 
                       new URLSearchParams(req.url.split('?')[1]).get('employeeId') || 
                       'EMP001';
    
    // Filter orders by employee ID
    const employeeOrders = orders.filter(order => order.employeeId === employeeId);
    
    return of(new HttpResponse({
      status: 200,
      body: employeeOrders
    })).pipe(delay(300));
  }

  // Mock specific order details endpoint
  if (req.url.match(/\/api\/orders\/[^/]+$/) && req.method === 'GET') {
    const orderId = req.url.split('/').pop();
    const order = orders.find(o => o.orderId === orderId);
    
    if (order) {
      return of(new HttpResponse({
        status: 200,
        body: order
      })).pipe(delay(200));
    } else {
      return of(new HttpResponse({
        status: 404,
        body: { message: 'Order not found' }
      })).pipe(delay(200));
    }
  }

  // Mock order cancellation endpoint
  if (req.url.match(/\/api\/orders\/[^/]+\/cancel$/) && req.method === 'POST') {
    const orderId = req.url.split('/')[3];
    const orderIndex = orders.findIndex(o => o.orderId === orderId);
    
    if (orderIndex !== -1) {
      orders[orderIndex].status = 'cancelled';
      return of(new HttpResponse({
        status: 200,
        body: { message: 'Order cancelled successfully' }
      })).pipe(delay(300));
    } else {
      return of(new HttpResponse({
        status: 404,
        body: { message: 'Order not found' }
      })).pipe(delay(200));
    }
  }

  // Default: pass through (or return 404 for unimplemented endpoints)
  console.log('[MockBackend] Unhandled endpoint:', req.url);
  return of(new HttpResponse({
    status: 404,
    body: {
      message: 'API endpoint not implemented in mock backend'
    }
  })).pipe(delay(100));
};
