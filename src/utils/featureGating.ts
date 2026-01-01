/**
 * Feature gating utilities based on subscription plans
 */

export type SubscriptionPlan = 'free' | 'pro' | 'enterprise';

export interface PlanLimits {
  maxProducts: number;
  maxCategories: number;
  maxPages: number; // Number of shareable pages allowed
  maxTeamMembersPerPage: number; // Team members per page
  canUseCustomDomain: boolean;
  canUseAdvancedAnalytics: boolean;
  canUseBulkImport: boolean;
  canUseAPI: boolean;
  canUseWhiteLabel: boolean;
  canUseTeamFeatures: boolean;
  maxTeamMembers: number; // Total team members across platform (deprecated - use maxTeamMembersPerPage)
  supportLevel: 'community' | 'priority' | 'dedicated';
}

export const PLAN_LIMITS: Record<SubscriptionPlan, PlanLimits> = {
  free: {
    maxProducts: 50,
    maxCategories: 10,
    maxPages: 1, // Free users can create 1 page
    maxTeamMembersPerPage: 0, // Solo only - no team members
    canUseCustomDomain: false,
    canUseAdvancedAnalytics: false,
    canUseBulkImport: true, // Allow bulk import for free users
    canUseAPI: false,
    canUseWhiteLabel: false,
    canUseTeamFeatures: false,
    maxTeamMembers: 1, // Deprecated
    supportLevel: 'community',
  },
  pro: {
    maxProducts: Infinity,
    maxCategories: Infinity,
    maxPages: 5, // Pro users can create 5 pages
    maxTeamMembersPerPage: 3, // 3 team members per page
    canUseCustomDomain: true,
    canUseAdvancedAnalytics: true,
    canUseBulkImport: true,
    canUseAPI: false,
    canUseWhiteLabel: false,
    canUseTeamFeatures: true, // Enable team features for Pro
    maxTeamMembers: 15, // Deprecated (5 pages * 3 members)
    supportLevel: 'priority',
  },
  enterprise: {
    maxProducts: Infinity,
    maxCategories: Infinity,
    maxPages: Infinity, // Unlimited pages for enterprise
    maxTeamMembersPerPage: Infinity, // Unlimited team members per page
    canUseCustomDomain: true,
    canUseAdvancedAnalytics: true,
    canUseBulkImport: true,
    canUseAPI: true,
    canUseWhiteLabel: true,
    canUseTeamFeatures: true,
    maxTeamMembers: Infinity,
    supportLevel: 'dedicated',
  },
};

/**
 * Get plan limits for a given subscription plan
 */
export function getPlanLimits(plan: SubscriptionPlan): PlanLimits {
  return PLAN_LIMITS[plan];
}

/**
 * Check if user can add more products
 */
export function canAddProduct(plan: SubscriptionPlan, currentProductCount: number): boolean {
  const limits = getPlanLimits(plan);
  return currentProductCount < limits.maxProducts;
}

/**
 * Get remaining product slots
 */
export function getRemainingProductSlots(plan: SubscriptionPlan, currentProductCount: number): number {
  const limits = getPlanLimits(plan);
  if (limits.maxProducts === Infinity) {
    return Infinity;
  }
  return Math.max(0, limits.maxProducts - currentProductCount);
}

/**
 * Check if a feature is available for the plan
 */
export function hasFeature(plan: SubscriptionPlan, feature: keyof PlanLimits): boolean {
  const limits = getPlanLimits(plan);
  return limits[feature] === true || limits[feature] === Infinity;
}

/**
 * Get upgrade message for a feature
 */
export function getUpgradeMessage(plan: SubscriptionPlan, feature: string): string {
  if (plan === 'enterprise') {
    return 'You already have access to all features.';
  }
  
  const upgradePlan = plan === 'free' ? 'Pro' : 'Enterprise';
  return `Upgrade to ${upgradePlan} to access ${feature}.`;
}

/**
 * Get plan display name
 */
export function getPlanDisplayName(plan: SubscriptionPlan): string {
  return plan.charAt(0).toUpperCase() + plan.slice(1);
}

/**
 * Check if user can add more pages
 */
export function canAddPage(plan: SubscriptionPlan, currentPageCount: number): boolean {
  const limits = getPlanLimits(plan);
  return currentPageCount < limits.maxPages;
}

/**
 * Get remaining page slots
 */
export function getRemainingPageSlots(plan: SubscriptionPlan, currentPageCount: number): number {
  const limits = getPlanLimits(plan);
  if (limits.maxPages === Infinity) {
    return Infinity;
  }
  return Math.max(0, limits.maxPages - currentPageCount);
}

/**
 * Check if user can add more team members to a page
 */
export function canAddTeamMember(
  plan: SubscriptionPlan,
  currentTeamMemberCount: number
): boolean {
  const limits = getPlanLimits(plan);
  // Free plan can't add team members
  if (limits.maxTeamMembersPerPage === 0) return false;
  // Unlimited for enterprise
  if (limits.maxTeamMembersPerPage === Infinity) return true;
  // Check against limit (excluding owner)
  return currentTeamMemberCount < limits.maxTeamMembersPerPage + 1;
}

/**
 * Get remaining team member slots for a page
 */
export function getRemainingTeamSlots(
  plan: SubscriptionPlan,
  currentTeamMemberCount: number
): number {
  const limits = getPlanLimits(plan);
  if (limits.maxTeamMembersPerPage === 0) return 0;
  if (limits.maxTeamMembersPerPage === Infinity) return Infinity;
  // currentTeamMemberCount includes owner, maxTeamMembersPerPage doesn't
  const totalAllowed = limits.maxTeamMembersPerPage + 1; // +1 for owner
  return Math.max(0, totalAllowed - currentTeamMemberCount);
}

/**
 * Get team feature availability message
 */
export function getTeamFeatureMessage(plan: SubscriptionPlan): string {
  const limits = getPlanLimits(plan);

  if (!limits.canUseTeamFeatures) {
    return 'Upgrade to Pro to add team members';
  }

  if (limits.maxTeamMembersPerPage === 0) {
    return 'Solo plan - upgrade to add team members';
  }

  if (limits.maxTeamMembersPerPage === Infinity) {
    return 'Unlimited team members';
  }

  return `Up to ${limits.maxTeamMembersPerPage} team members per page`;
}

