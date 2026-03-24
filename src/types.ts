import { Language } from './translations';

export interface Review {
  id: string;
  userId: string;
  productId: string;
  userName: string;
  rating: number;
  comment: string;
  createdAt: any;
}

export interface ProductVariant {
  id: string;
  name: string; // e.g., "50g", "100g", "250g"
  price: number;
  stock: number;
}

export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  rating: number;
  image: string;
  images?: string[];
  category: string;
  trending?: boolean;
  featured?: boolean;
  bestSeller?: boolean;
  stock: number;
  reviews?: { [key: string]: Review };
  variants?: ProductVariant[];
  isOrganic?: boolean;
  isGlutenFree?: boolean;
  isVegan?: boolean;
}

export interface CartItem extends Product {
  cartItemId: string;
  quantity: number;
  selectedVariant?: ProductVariant;
}

export interface Banner {
  id: string;
  title: string;
  subtitle?: string;
  image: string;
  images?: string[];
  createdAt?: number;
}

export interface Category {
  id: string;
  name: string;
  image: string;
  icon?: string;
  createdAt?: number;
}

export type OrderStatus = 'Order Placed' | 'Processing' | 'Shipping' | 'Delivery' | 'Delivered' | 'Cancelled';

export interface Order {
  id: string;
  userId: string;
  items: CartItem[];
  subtotal: number;
  discount: number;
  total: number;
  status: OrderStatus;
  address: string;
  paymentMethod: string;
  createdAt: number;
  estimatedDelivery?: number;
  trackingNumber?: string;
  couponCode?: string;
}

export interface Coupon {
  code: string;
  discountType: 'percentage' | 'fixed';
  discountValue: number;
  minPurchase?: number;
  expiryDate: number;
  isActive: boolean;
}

export interface NotificationPreferences {
  orderUpdates: boolean;
  specialOffers: boolean;
  newProducts: boolean;
}

export interface UserProfile {
  uid: string;
  name: string;
  email: string;
  phone?: string;
  address?: string;
  city?: string;
  state?: string;
  pincode?: string;
  role?: 'admin' | 'user';
  wishlist?: string[];
  language?: Language;
  notificationPreferences?: NotificationPreferences;
}

export type Screen = 'splash' | 'auth' | 'login' | 'signup' | 'home' | 'product-details' | 'cart' | 'checkout' | 'orders' | 'profile' | 'admin-dashboard' | 'admin-products' | 'admin-orders' | 'all-products' | 'wishlist';
