
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
export type UserRole = 'admin' | 'affiliate_marketer' | 'end_user';

export interface User {
  id: string;
  name: string;
  email: string;
  image?: string;
  username?: string;
  avatar?: string;
  plan: SubscriptionPlan;
  role: UserRole;
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

// ============================================================================
// Page Types (Shareable Storefronts)
// ============================================================================

export type PageRole = 'owner' | 'admin' | 'editor' | 'viewer';

export interface Page {
  id: string;
  userId: string;
  slug: string;
  title: string;
  description?: string;
  bio?: string;
  avatarUrl?: string;
  coverImageUrl?: string;
  themeSettings?: Record<string, any>;
  socialLinks?: Record<string, string>;
  isActive: boolean;
  isPublic: boolean;
  viewCount: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface PageProduct {
  id: string;
  pageId: string;
  productId: string;
  displayOrder: number;
  isFeatured: boolean;
  addedAt: Date;
}

export interface PageLimits {
  userId: string;
  maxPages: number; // -1 for unlimited
  pagesCreated: number;
  lastUpdated: Date;
}

export interface PageFormData {
  slug: string;
  title: string;
  description?: string;
  bio?: string;
  avatarUrl?: string;
  coverImageUrl?: string;
  themeSettings?: Record<string, any>;
  socialLinks?: Record<string, string>;
  isPublic: boolean;
}

// ============================================================================
// Collaboration Types (Team Management)
// ============================================================================

export interface PageCollaborator {
  id: string;
  pageId: string;
  userId: string;
  role: PageRole;
  invitedBy?: string;
  invitedAt: Date;
  acceptedAt?: Date;
  isActive: boolean;
  permissions?: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;
  // Populated fields (from joins)
  user?: {
    id: string;
    name: string;
    email: string;
    avatar?: string;
  };
}

export interface PageInvitation {
  id: string;
  pageId: string;
  email: string;
  role: PageRole;
  invitedBy: string;
  token: string;
  expiresAt: Date;
  accepted: boolean;
  acceptedBy?: string;
  acceptedAt?: Date;
  createdAt: Date;
  // Populated fields
  page?: {
    id: string;
    title: string;
    slug: string;
  };
  inviter?: {
    id: string;
    name: string;
    email: string;
  };
}

export interface TeamMemberLimits {
  pageId: string;
  maxMembers: number; // 0 for free, 3 for pro, -1 for unlimited
  currentMembers: number;
  lastUpdated: Date;
}

export interface ActivityLogEntry {
  id: string;
  pageId?: string;
  userId?: string;
  action: string;
  targetUserId?: string;
  metadata?: Record<string, any>;
  ipAddress?: string;
  userAgent?: string;
  createdAt: Date;
  // Populated fields
  user?: {
    id: string;
    name: string;
    email: string;
  };
  targetUser?: {
    id: string;
    name: string;
    email: string;
  };
}

export interface PagePermissions {
  canEditPage: boolean;
  canDeletePage: boolean;
  canAddProducts: boolean;
  canEditProducts: boolean;
  canDeleteProducts: boolean;
  canViewAnalytics: boolean;
  canInviteMembers: boolean;
  canRemoveMembers: boolean;
  canChangeRoles: boolean;
}

export interface InviteMemberFormData {
  email: string;
  role: PageRole;
  message?: string;
}

// ============================================================================
// Analytics Types (Enhanced with Device Tracking)
// ============================================================================

export type DeviceType = 'mobile' | 'tablet' | 'desktop' | 'unknown';
export type AnalyticsEventType = 'view' | 'click' | 'conversion' | 'page_view' | 'product_view' | 'buy_now_click';

export interface ClickEvent {
  id: string;
  productId?: string;
  pageId?: string;
  userId: string;
  eventType: AnalyticsEventType;
  deviceType: DeviceType;
  browser?: string;
  os?: string;
  visitorIp?: string;
  userAgent?: string;
  referrer?: string;
  url?: string;
  country?: string;
  sessionId?: string;
  createdAt: Date;
}

export interface DeviceInfo {
  type: DeviceType;
  browser: string;
  os: string;
  userAgent: string;
}

export interface AnalyticsData {
  totalViews: number;
  totalClicks: number;
  totalConversions: number;
  clickThroughRate: number;
  conversionRate: number;
  deviceBreakdown: {
    mobile: number;
    tablet: number;
    desktop: number;
    unknown: number;
  };
  topProducts: Array<{
    productId: string;
    productTitle: string;
    clicks: number;
    conversions: number;
  }>;
  recentEvents: ClickEvent[];
}

// ============================================================================
// Permission Types
// ============================================================================

export interface RolePermissions {
  canManageUsers: boolean;
  canViewAllPages: boolean;
  canViewAllAnalytics: boolean;
  canManageSystem: boolean;
  canCreatePages: boolean;
  canCreateProducts: boolean;
  canEditOwnPages: boolean;
  canEditOwnProducts: boolean;
  canViewOwnAnalytics: boolean;
  canDeleteOwnPages: boolean;
  canDeleteOwnProducts: boolean;
}

export interface PermissionCheck {
  hasPermission: boolean;
  reason?: string;
}
