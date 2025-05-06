
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

export interface User {
  id: string;
  name: string;
  email: string;
  image?: string;
  username: string;
  createdAt: Date;
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

export type ViewMode = "grid" | "list";
export type SortOption = "newest" | "price-low-high" | "price-high-low" | "rating";

export interface FilterOptions {
  categories: string[];
  tags: string[];
  priceRange: [number, number];
  rating: number;
}
