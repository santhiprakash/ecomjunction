# Pricing Plans & Feature Gating

## Pricing Tiers

### Free Plan - $0/month
**Target:** Beginners and hobbyists

**Limits:**
- 50 products maximum
- 1 showcase page
- Basic theme customization
- Standard analytics (30 days)
- Community support
- 10 AI enhancements/month
- 50 AI chat messages/month
- 20 AI product extractions/month
- 1GB storage

**Features:**
- ✅ Product management
- ✅ Basic filtering & search
- ✅ Affiliate link management
- ✅ Basic analytics
- ✅ Mobile responsive
- ✅ Social media links
- ❌ Custom domain
- ❌ Advanced analytics
- ❌ Priority support
- ❌ White-label
- ❌ API access

---

### Pro Plan - $19/month
**Target:** Serious affiliate marketers and influencers

**Limits:**
- Unlimited products
- 5 showcase pages
- Advanced theme customization
- Advanced analytics (1 year)
- Priority email support
- 100 AI enhancements/month
- 500 AI chat messages/month
- 200 AI product extractions/month
- 10GB storage

**Features:**
- ✅ Everything in Free
- ✅ Unlimited products
- ✅ Custom domain
- ✅ Advanced analytics
- ✅ A/B testing
- ✅ Email campaigns
- ✅ Priority support
- ✅ Remove branding
- ✅ Advanced AI features
- ✅ Bulk operations
- ❌ Team members
- ❌ API access
- ❌ White-label

---

### Enterprise Plan - $99/month
**Target:** Agencies and large teams

**Limits:**
- Unlimited everything
- Unlimited showcase pages
- Full customization
- Lifetime analytics
- Dedicated support
- Unlimited AI usage
- 100GB storage

**Features:**
- ✅ Everything in Pro
- ✅ Team collaboration (up to 10 members)
- ✅ API access
- ✅ White-label options
- ✅ Custom integrations
- ✅ Dedicated account manager
- ✅ SLA guarantee
- ✅ Advanced security
- ✅ Custom contracts
- ✅ Training & onboarding

---

## Feature Comparison Table

| Feature | Free | Pro | Enterprise |
|---------|------|-----|------------|
| **Products** | 50 | Unlimited | Unlimited |
| **Showcase Pages** | 1 | 5 | Unlimited |
| **Storage** | 1GB | 10GB | 100GB |
| **Custom Domain** | ❌ | ✅ | ✅ |
| **Analytics Retention** | 30 days | 1 year | Lifetime |
| **AI Enhancements** | 10/mo | 100/mo | Unlimited |
| **AI Chat Messages** | 50/mo | 500/mo | Unlimited |
| **AI Extractions** | 20/mo | 200/mo | Unlimited |
| **Team Members** | 1 | 1 | 10 |
| **API Access** | ❌ | ❌ | ✅ |
| **Priority Support** | ❌ | ✅ | ✅ |
| **White-label** | ❌ | ❌ | ✅ |
| **A/B Testing** | ❌ | ✅ | ✅ |
| **Email Campaigns** | ❌ | ✅ | ✅ |
| **Remove Branding** | ❌ | ✅ | ✅ |
| **SLA** | ❌ | ❌ | 99.9% |

---

## Implementation

### 1. Database Schema

```sql
-- Add subscription fields to users table
ALTER TABLE users ADD COLUMN IF NOT EXISTS subscription_plan VARCHAR(20) DEFAULT 'free';
ALTER TABLE users ADD COLUMN IF NOT EXISTS subscription_status VARCHAR(20) DEFAULT 'active';
ALTER TABLE users ADD COLUMN IF NOT EXISTS subscription_started_at TIMESTAMP WITH TIME ZONE;
ALTER TABLE users ADD COLUMN IF NOT EXISTS subscription_expires_at TIMESTAMP WITH TIME ZONE;
ALTER TABLE users ADD COLUMN IF NOT EXISTS stripe_customer_id VARCHAR(255);
ALTER TABLE users ADD COLUMN IF NOT EXISTS stripe_subscription_id VARCHAR(255);

-- Create subscriptions table for history
CREATE TABLE subscriptions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    plan VARCHAR(20) NOT NULL,
    status VARCHAR(20) NOT NULL, -- 'active', 'cancelled', 'expired'
    started_at TIMESTAMP WITH TIME ZONE NOT NULL,
    expires_at TIMESTAMP WITH TIME ZONE,
    stripe_subscription_id VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_subscriptions_user_id ON subscriptions(user_id);
CREATE INDEX idx_subscriptions_status ON subscriptions(status);

-- Create usage tracking table
CREATE TABLE usage_tracking (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    resource VARCHAR(50) NOT NULL, -- 'products', 'storage', 'ai_enhancements', etc.
    count INTEGER NOT NULL DEFAULT 0,
    period_start TIMESTAMP WITH TIME ZONE NOT NULL,
    period_end TIMESTAMP WITH TIME ZONE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_usage_tracking_user_id ON usage_tracking(user_id);
CREATE INDEX idx_usage_tracking_resource ON usage_tracking(resource);
CREATE INDEX idx_usage_tracking_period ON usage_tracking(period_start, period_end);
```

### 2. Feature Limits Configuration

```typescript
// src/config/plans.ts
export const PLAN_LIMITS = {
  free: {
    products: 50,
    showcases: 1,
    storage: 1024 * 1024 * 1024, // 1GB in bytes
    analytics_retention_days: 30,
    ai_enhancements: 10,
    ai_chat_messages: 50,
    ai_extractions: 20,
    team_members: 1,
    custom_domain: false,
    api_access: false,
    priority_support: false,
    white_label: false,
    ab_testing: false,
    email_campaigns: false,
    remove_branding: false,
  },
  pro: {
    products: -1, // unlimited
    showcases: 5,
    storage: 10 * 1024 * 1024 * 1024, // 10GB
    analytics_retention_days: 365,
    ai_enhancements: 100,
    ai_chat_messages: 500,
    ai_extractions: 200,
    team_members: 1,
    custom_domain: true,
    api_access: false,
    priority_support: true,
    white_label: false,
    ab_testing: true,
    email_campaigns: true,
    remove_branding: true,
  },
  enterprise: {
    products: -1,
    showcases: -1,
    storage: 100 * 1024 * 1024 * 1024, // 100GB
    analytics_retention_days: -1, // lifetime
    ai_enhancements: -1,
    ai_chat_messages: -1,
    ai_extractions: -1,
    team_members: 10,
    custom_domain: true,
    api_access: true,
    priority_support: true,
    white_label: true,
    ab_testing: true,
    email_campaigns: true,
    remove_branding: true,
  },
} as const;

export type PlanName = keyof typeof PLAN_LIMITS;
```

### 3. Feature Gate Service

```typescript
// src/lib/feature-gate.ts
import { PLAN_LIMITS } from '@/config/plans';

export class FeatureGate {
  constructor(private user: User) {}

  // Check if user can perform action
  async canAddProduct(): Promise<boolean> {
    const plan = this.user.subscription_plan;
    const limit = PLAN_LIMITS[plan].products;
    
    if (limit === -1) return true; // unlimited
    
    const count = await this.getProductCount();
    return count < limit;
  }

  async canAddShowcase(): Promise<boolean> {
    const plan = this.user.subscription_plan;
    const limit = PLAN_LIMITS[plan].showcases;
    
    if (limit === -1) return true;
    
    const count = await this.getShowcaseCount();
    return count < limit;
  }

  async canUploadFile(fileSize: number): Promise<boolean> {
    const plan = this.user.subscription_plan;
    const limit = PLAN_LIMITS[plan].storage;
    
    const used = await this.getStorageUsed();
    return (used + fileSize) <= limit;
  }

  async canUseAI(feature: 'enhancements' | 'chat' | 'extractions'): Promise<boolean> {
    const plan = this.user.subscription_plan;
    const limitKey = `ai_${feature}` as keyof typeof PLAN_LIMITS.free;
    const limit = PLAN_LIMITS[plan][limitKey] as number;
    
    if (limit === -1) return true;
    
    const used = await this.getAIUsage(feature);
    return used < limit;
  }

  hasFeature(feature: string): boolean {
    const plan = this.user.subscription_plan;
    return PLAN_LIMITS[plan][feature as keyof typeof PLAN_LIMITS.free] === true;
  }

  // Helper methods
  private async getProductCount(): Promise<number> {
    const result = await db.queryOne(
      'SELECT COUNT(*) as count FROM products WHERE user_id = $1',
      [this.user.id]
    );
    return parseInt(result.count);
  }

  private async getShowcaseCount(): Promise<number> {
    const result = await db.queryOne(
      'SELECT COUNT(*) as count FROM showcases WHERE user_id = $1',
      [this.user.id]
    );
    return parseInt(result.count);
  }

  private async getStorageUsed(): Promise<number> {
    const result = await db.queryOne(
      'SELECT SUM(file_size) as total FROM uploads WHERE user_id = $1',
      [this.user.id]
    );
    return parseInt(result.total || '0');
  }

  private async getAIUsage(feature: string): Promise<number> {
    const result = await db.queryOne(`
      SELECT COUNT(*) as count
      FROM ai_usage
      WHERE user_id = $1
      AND feature = $2
      AND created_at >= DATE_TRUNC('month', NOW())
    `, [this.user.id, feature]);
    return parseInt(result.count);
  }
}
```

### 4. Middleware for Feature Gating

```typescript
// middleware/feature-gate.ts
export function requireFeature(feature: string) {
  return async (req: Request, res: Response, next: NextFunction) => {
    const user = req.user;
    const gate = new FeatureGate(user);

    if (!gate.hasFeature(feature)) {
      return res.status(403).json({
        error: 'Feature not available in your plan',
        feature,
        current_plan: user.subscription_plan,
        upgrade_url: '/pricing',
      });
    }

    next();
  };
}

export function requireLimit(check: (gate: FeatureGate) => Promise<boolean>) {
  return async (req: Request, res: Response, next: NextFunction) => {
    const user = req.user;
    const gate = new FeatureGate(user);

    const allowed = await check(gate);
    if (!allowed) {
      return res.status(403).json({
        error: 'Usage limit exceeded',
        current_plan: user.subscription_plan,
        upgrade_url: '/pricing',
      });
    }

    next();
  };
}
```

### 5. Usage in API Routes

```typescript
// api/products/create.ts
app.post('/api/products', 
  requireAuth,
  requireLimit(gate => gate.canAddProduct()),
  async (req, res) => {
    // Create product
  }
);

// api/showcases/create.ts
app.post('/api/showcases',
  requireAuth,
  requireLimit(gate => gate.canAddShowcase()),
  async (req, res) => {
    // Create showcase
  }
);

// api/upload.ts
app.post('/api/upload',
  requireAuth,
  async (req, res) => {
    const file = req.file;
    const gate = new FeatureGate(req.user);
    
    if (!await gate.canUploadFile(file.size)) {
      return res.status(403).json({
        error: 'Storage limit exceeded',
        used: await gate.getStorageUsed(),
        limit: PLAN_LIMITS[req.user.subscription_plan].storage,
      });
    }
    
    // Upload file
  }
);

// api/ai/enhance.ts
app.post('/api/ai/enhance',
  requireAuth,
  requireLimit(gate => gate.canUseAI('enhancements')),
  async (req, res) => {
    // Enhance with AI
  }
);
```

---

## Frontend Components

### Upgrade Prompt

```typescript
// src/components/pricing/UpgradePrompt.tsx
export function UpgradePrompt({ 
  feature, 
  currentPlan 
}: { 
  feature: string; 
  currentPlan: string;
}) {
  return (
    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
      <div className="flex items-start gap-3">
        <Lock className="w-5 h-5 text-yellow-600 mt-0.5" />
        <div className="flex-1">
          <h3 className="font-semibold text-yellow-900">
            Upgrade Required
          </h3>
          <p className="text-sm text-yellow-700 mt-1">
            {feature} is not available in your {currentPlan} plan.
          </p>
          <Link
            to="/pricing"
            className="inline-flex items-center gap-2 mt-3 text-sm font-medium text-yellow-900 hover:text-yellow-700"
          >
            View Plans <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </div>
  );
}
```

### Usage Indicator

```typescript
// src/components/pricing/UsageIndicator.tsx
export function UsageIndicator({ 
  resource, 
  used, 
  limit 
}: { 
  resource: string; 
  used: number; 
  limit: number;
}) {
  const percentage = limit === -1 ? 0 : (used / limit) * 100;
  const isNearLimit = percentage >= 80;
  const isAtLimit = percentage >= 100;

  return (
    <div className="space-y-2">
      <div className="flex justify-between text-sm">
        <span className="text-gray-600">{resource}</span>
        <span className={cn(
          "font-medium",
          isAtLimit && "text-red-600",
          isNearLimit && !isAtLimit && "text-yellow-600"
        )}>
          {limit === -1 ? 'Unlimited' : `${used} / ${limit}`}
        </span>
      </div>
      {limit !== -1 && (
        <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
          <div
            className={cn(
              "h-full transition-all",
              isAtLimit && "bg-red-500",
              isNearLimit && !isAtLimit && "bg-yellow-500",
              !isNearLimit && "bg-green-500"
            )}
            style={{ width: `${Math.min(percentage, 100)}%` }}
          />
        </div>
      )}
    </div>
  );
}
```

### Pricing Page

```typescript
// src/pages/Pricing.tsx
export function PricingPage() {
  const { user } = useAuth();

  return (
    <div className="container mx-auto py-12">
      <h1 className="text-4xl font-bold text-center mb-4">
        Choose Your Plan
      </h1>
      <p className="text-center text-gray-600 mb-12">
        Start free, upgrade as you grow
      </p>

      <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
        {/* Free Plan */}
        <PricingCard
          name="Free"
          price="$0"
          period="forever"
          features={[
            '50 products',
            '1 showcase page',
            'Basic analytics',
            '10 AI enhancements/mo',
            '1GB storage',
            'Community support',
          ]}
          current={user?.subscription_plan === 'free'}
          cta="Get Started"
        />

        {/* Pro Plan */}
        <PricingCard
          name="Pro"
          price="$19"
          period="per month"
          features={[
            'Unlimited products',
            '5 showcase pages',
            'Advanced analytics',
            '100 AI enhancements/mo',
            '10GB storage',
            'Priority support',
            'Custom domain',
            'Remove branding',
          ]}
          current={user?.subscription_plan === 'pro'}
          highlighted
          cta="Upgrade to Pro"
        />

        {/* Enterprise Plan */}
        <PricingCard
          name="Enterprise"
          price="$99"
          period="per month"
          features={[
            'Everything in Pro',
            'Unlimited everything',
            '10 team members',
            'API access',
            'White-label',
            'Dedicated support',
            '100GB storage',
            'SLA guarantee',
          ]}
          current={user?.subscription_plan === 'enterprise'}
          cta="Contact Sales"
        />
      </div>
    </div>
  );
}
```

---

## Stripe Integration

```typescript
// lib/stripe.ts
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2023-10-16',
});

export const STRIPE_PRICES = {
  pro: 'price_xxx', // Replace with actual Stripe price ID
  enterprise: 'price_yyy',
};

export async function createCheckoutSession(
  userId: string,
  plan: 'pro' | 'enterprise'
) {
  const session = await stripe.checkout.sessions.create({
    customer_email: user.email,
    line_items: [
      {
        price: STRIPE_PRICES[plan],
        quantity: 1,
      },
    ],
    mode: 'subscription',
    success_url: `${process.env.APP_URL}/dashboard?success=true`,
    cancel_url: `${process.env.APP_URL}/pricing?canceled=true`,
    metadata: {
      user_id: userId,
      plan,
    },
  });

  return session.url;
}

export async function handleWebhook(event: Stripe.Event) {
  switch (event.type) {
    case 'checkout.session.completed':
      await handleCheckoutCompleted(event.data.object);
      break;
    case 'customer.subscription.updated':
      await handleSubscriptionUpdated(event.data.object);
      break;
    case 'customer.subscription.deleted':
      await handleSubscriptionDeleted(event.data.object);
      break;
  }
}
```

---

## Testing

```typescript
// tests/feature-gate.test.ts
describe('Feature Gating', () => {
  it('should block free user from adding 51st product', async () => {
    const user = { id: 'test', subscription_plan: 'free' };
    const gate = new FeatureGate(user);

    // Add 50 products
    for (let i = 0; i < 50; i++) {
      await addProduct(user.id);
    }

    // 51st should fail
    expect(await gate.canAddProduct()).toBe(false);
  });

  it('should allow pro user unlimited products', async () => {
    const user = { id: 'test', subscription_plan: 'pro' };
    const gate = new FeatureGate(user);

    expect(await gate.canAddProduct()).toBe(true);
  });
});
```

---

## Deployment Checklist

- [ ] Set up Stripe account
- [ ] Create products and prices in Stripe
- [ ] Configure webhook endpoint
- [ ] Update database schema
- [ ] Implement feature gate service
- [ ] Add middleware to API routes
- [ ] Create pricing page
- [ ] Add upgrade prompts
- [ ] Add usage indicators
- [ ] Test all limits
- [ ] Test upgrade flow
- [ ] Test downgrade flow
- [ ] Document for users

---

**Status:** Ready to implement  
**Estimated Time:** 2 weeks  
**Revenue Potential:** $19-99/user/month
