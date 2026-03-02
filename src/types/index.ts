export interface Product {
  id: string;
  name: string;
  price: number;
  originalPrice?: number;
  image: string;
  category: string;
  rating: number;
  reviews: number;
  description?: string;
  inStock: boolean;
  colors?: string[];
  tags?: string[];
}

export interface CartItem extends Product {
  quantity: number;
}

export interface Category {
  id: string;
  name: string;
  image: string;
  count: number;
}

// types/user.ts or update existing types
export interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  role?: string;
  platform?: string;
  isVerified?: boolean;
  totalOrders?: number;
  totalSpent?: number;
  createdAt?: string;
  phone?: string;
  address?: {
    street?: string;
    city?: string;
    state?: string;
    country?: string;
    zipCode?: string;
  };
}

// If you have an existing types/index.ts, add:
export interface AuthResponse {
  success: boolean;
  message?: string;
  token?: string;
  customer?: User;
  errors?: string[];
}

export interface Address {
  id: string;
  fullName: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  pincode: string;
  isDefault: boolean;
}

export interface Order {
  id: string;
  date: string;
  total: number;
  status: 'processing' | 'shipped' | 'delivered' | 'cancelled';
  items: CartItem[];
  shippingAddress: Address;
}
