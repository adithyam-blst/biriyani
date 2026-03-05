import { Component, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { OrderService, BiriyaniType, OrderItem } from '../../services/order.service';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-home-s',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './home-s.html',
  styleUrl: './home-s.css'
})
export class HomeS implements OnInit {
  // Biriyani menu data
  biriyanis = signal<BiriyaniType[]>([
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
  ]);

  // Cart state
  cart = signal<OrderItem[]>([]);
  selectedSpiceLevels: { [key: string]: string } = {};
  specialInstructions = signal('');
  deliveryLocation = signal('Office Desk');
  
  // UI state
  isPlacingOrder = signal(false);
  orderSuccess = signal(false);
  orderError = signal('');
  activeCategory = signal<'all' | 'veg' | 'non-veg'>('all');
  showCart = signal(false);

  // Computed values
  totalAmount = computed(() => {
    return this.cart().reduce((sum, item) => sum + (item.price * item.quantity), 0);
  });

  totalItems = computed(() => {
    return this.cart().reduce((sum, item) => sum + item.quantity, 0);
  });

  filteredBiriyanis = computed(() => {
    if (this.activeCategory() === 'all') {
      return this.biriyanis();
    }
    return this.biriyanis().filter(b => b.category === this.activeCategory());
  });

  isBiriyaniFriday = computed(() => {
    const today = new Date();
    return today.getDay() === 5; // Friday is 5
  });

  nextFriday = computed(() => {
    const today = new Date();
    const nextFriday = new Date(today);
    const daysUntilFriday = (5 - today.getDay() + 7) % 7;
    nextFriday.setDate(today.getDate() + (daysUntilFriday === 0 ? 7 : daysUntilFriday));
    return nextFriday;
  });

  employeeName = signal('');

  constructor(
    private orderService: OrderService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    // Get employee info
    const empId = this.authService.getEmployeeId();
    if (empId) {
      this.employeeName.set(`Employee ${empId}`);
    }
    
    // Initialize spice levels
    this.biriyanis().forEach(b => {
      this.selectedSpiceLevels[b.id] = b.spiceLevel;
    });
  }

  addToCart(biriyani: BiriyaniType): void {
    const spiceLevel = this.selectedSpiceLevels[biriyani.id] || biriyani.spiceLevel;
    const existingItem = this.cart().find(item => 
      item.biriyaniId === biriyani.id && item.spiceLevel === spiceLevel
    );

    if (existingItem) {
      this.cart.update(cart => 
        cart.map(item => 
          item.biriyaniId === biriyani.id && item.spiceLevel === spiceLevel
            ? { ...item, quantity: item.quantity + 1 }
            : item
        )
      );
    } else {
      this.cart.update(cart => [
        ...cart,
        {
          biriyaniId: biriyani.id,
          name: biriyani.name,
          quantity: 1,
          price: biriyani.price,
          spiceLevel: spiceLevel
        }
      ]);
    }
  }

  removeFromCart(item: OrderItem): void {
    this.cart.update(cart => 
      cart.filter(cartItem => 
        !(cartItem.biriyaniId === item.biriyaniId && cartItem.spiceLevel === item.spiceLevel)
      )
    );
  }

  updateQuantity(item: OrderItem, change: number): void {
    this.cart.update(cart => 
      cart.map(cartItem => {
        if (cartItem.biriyaniId === item.biriyaniId && cartItem.spiceLevel === item.spiceLevel) {
          const newQuantity = Math.max(0, cartItem.quantity + change);
          return { ...cartItem, quantity: newQuantity };
        }
        return cartItem;
      }).filter(cartItem => cartItem.quantity > 0)
    );
  }

  setCategory(category: 'all' | 'veg' | 'non-veg'): void {
    this.activeCategory.set(category);
  }

  toggleCart(): void {
    this.showCart.update(v => !v);
  }

  async placeOrder(): Promise<void> {
    if (this.cart().length === 0) {
      this.orderError.set('Please add items to your cart');
      return;
    }

    this.isPlacingOrder.set(true);
    this.orderError.set('');

    try {
      const deliveryDate = this.isBiriyaniFriday() 
        ? new Date().toISOString() 
        : this.nextFriday().toISOString();

      const order = {
        items: this.cart(),
        totalAmount: this.totalAmount(),
        deliveryDate: deliveryDate,
        specialInstructions: this.specialInstructions(),
        deliveryLocation: this.deliveryLocation()
      };

      this.orderService.placeOrder(order).subscribe({
        next: () => {
          this.isPlacingOrder.set(false);
          this.orderSuccess.set(true);
          this.cart.set([]);
          this.specialInstructions.set('');
          
          // Reset success message after 3 seconds
          setTimeout(() => {
            this.orderSuccess.set(false);
          }, 5000);
        },
        error: (error) => {
          this.isPlacingOrder.set(false);
          this.orderError.set(error.error?.message || 'Failed to place order. Please try again.');
        }
      });
    } catch (error) {
      this.isPlacingOrder.set(false);
      this.orderError.set('An unexpected error occurred');
    }
  }

  getSpiceEmoji(level: string): string {
    const emojis: { [key: string]: string } = {
      'mild': '🌶️',
      'medium': '🌶️🌶️',
      'hot': '🌶️🌶️🌶️'
    };
    return emojis[level] || '🌶️';
  }

  scrollToMenu(): void {
    const menuSection = document.getElementById('menu-section');
    if (menuSection) {
      menuSection.scrollIntoView({ behavior: 'smooth' });
    }
  }
}
