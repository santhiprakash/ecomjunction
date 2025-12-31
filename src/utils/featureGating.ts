/**
 * Feature gating utilities based on subscription plans
 */

export type SubscriptionPlan = 'free' | 'pro' | 'enterprise';

export interface PlanLimits {
  maxProducts: number;
  maxCategories: number;
  canUseCustomDomain: boolean;
  canUseAdvancedAnalytics: boolean;
  canUseBulkImport: boolean;
  canUseAPI: boolean;
  canUseWhiteLabel: boolean;
  canUseTeamFeatures: boolean;
  maxTeamMembers: number;
  supportLevel: 'community' | 'priority' | 'dedicated';
}

export const PLAN_LIMITS: Record<SubscriptionPlan, PlanLimits> = {
  free: {
    maxProducts: 50,
    maxCategories: 10,
    canUseCustomDomain: false,
    canUseAdvancedAnalytics: false,
    canUseBulkImport: true, // Allow bulk import for free users
    canUseAPI: false,
    canUseWhiteLabel: false,
    canUseTeamFeatures: false,
    maxTeamMembers: 1,
    supportLevel: 'community',
  },
  pro: {
    maxProducts: Infinity,
    maxCategories: Infinity,
    canUseCustomDomain: true,
    canUseAdvancedAnalytics: true,
    canUseBulkImport: true,
    canUseAPI: false,
    canUseWhiteLabel: false,
    canUseTeamFeatures: false,
    maxTeamMembers: 1,
    supportLevel: 'priority',
  },
  enterprise: {
    maxProducts: Infinity,
    maxCategories: Infinity,
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

