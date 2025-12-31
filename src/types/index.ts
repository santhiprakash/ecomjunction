
export interface Product {
  id: string;
  title: string;
  description: string;
  price: number;
  currency: string;
  rating: number;
  image: string;
  link: string;
  source: string;
  tags: string[];
  categories: string[];
  createdAt: Date;
}

export type SubscriptionPlan = 'free' | 'pro' | 'enterprise';

export interface User {
  id: string;
  name: string;
  email: string;
  image?: string;
  username?: string;
  avatar?: string;
  plan: SubscriptionPlan;
  createdAt: Date;
  lastLoginAt?: Date;
  isDemo?: boolean;
  // Additional fields from database schema
  bio?: string;
  websiteUrl?: string;
  socialLinks?: Record<string, string>;
  themeSettings?: Record<string, any>;
  emailVerified?: boolean;
}

export interface ThemeSettings {
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
  textColor: string;
  backgroundColor: string;
}

export type Currency = "USD" | "INR" | "EUR" | "GBP";

export interface ProductFormData {
  title: string;
  description: string;
  price: number;
  currency: Currency;
  image: string;
  link: string;
  source: string;
  tags: string[];
  categories: string[];
}

export type ViewMode = "grid" | "list" | "table";
export type SortOption = "newest" | "price-low-high" | "price-high-low" | "rating";

export interface FilterOptions {
  categories: string[];
  tags: string[];
  priceRange: [number, number];
  rating: number;
}
