// Core types for ecomjunction

export interface Store {
  id: string;
  name: string;
  slug: string;
  description?: string;
  logo?: string;
  ownerId: string;
  createdAt: Date;
  updatedAt: Date;
  isActive: boolean;
}

export interface Product {
  id: string;
  storeId: string;
  name: string;
  description: string;
  price: number;
  compareAtPrice?: number;
  images: string[];
  inventory: number;
  sku?: string;
  status: 'draft' | 'active' | 'archived';
  createdAt: Date;
  updatedAt: Date;
}

export interface User {
  id: string;
  email: string;
  name?: string;
  avatar?: string;
  role: 'admin' | 'merchant' | 'customer';
  createdAt: Date;
  updatedAt: Date;
}

export interface Order {
  id: string;
  storeId: string;
  customerId: string;
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  total: number;
  items: OrderItem[];
  shippingAddress: Address;
  createdAt: Date;
  updatedAt: Date;
}

export interface OrderItem {
  id: string;
  orderId: string;
  productId: string;
  quantity: number;
  price: number; // Price at time of purchase
}

export interface Address {
  street: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
}
