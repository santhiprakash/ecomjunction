/**
 * NeonDB (PostgreSQL) Database Client
 * Replaces Supabase with direct PostgreSQL connection via Neon
 */

import { Pool, PoolClient } from 'pg';

// Environment variables
const databaseUrl = import.meta.env.DATABASE_URL || import.meta.env.VITE_NEON_DATABASE_URL;

// Create PostgreSQL connection pool
// Note: In production, database connections should be made from backend API, not client-side
// This allows graceful degradation if DATABASE_URL is not configured
export const pool = databaseUrl ? new Pool({
  connectionString: databaseUrl,
  ssl: {
    rejectUnauthorized: false, // Required for Neon
  },
  max: 20, // Maximum number of clients in the pool
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
}) : null;

// Database types (matching schema)
export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string;
          email: string;
          username: string | null;
          first_name: string | null;
          last_name: string | null;
          bio: string | null;
          avatar_url: string | null;
          website_url: string | null;
          social_links: Record<string, any> | null;
          theme_settings: Record<string, any> | null;
          subscription_plan: 'free' | 'pro' | 'enterprise';
          is_active: boolean;
          email_verified: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          email: string;
          username?: string | null;
          first_name?: string | null;
          last_name?: string | null;
          bio?: string | null;
          avatar_url?: string | null;
          website_url?: string | null;
          social_links?: Record<string, any> | null;
          theme_settings?: Record<string, any> | null;
          subscription_plan?: 'free' | 'pro' | 'enterprise';
          is_active?: boolean;
          email_verified?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          email?: string;
          username?: string | null;
          first_name?: string | null;
          last_name?: string | null;
          bio?: string | null;
          avatar_url?: string | null;
          website_url?: string | null;
          social_links?: Record<string, any> | null;
          theme_settings?: Record<string, any> | null;
          subscription_plan?: 'free' | 'pro' | 'enterprise';
          is_active?: boolean;
          email_verified?: boolean;
          created_at?: string;
          updated_at?: string;
        };
      };
      products: {
        Row: {
          id: string;
          user_id: string;
          title: string;
          description: string | null;
          price: number | null;
          currency: string;
          affiliate_url: string;
          image_url: string | null;
          category: string | null;
          tags: string[] | null;
          commission_rate: number | null;
          rating: number | null;
          is_active: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          title: string;
          description?: string | null;
          price?: number | null;
          currency?: string;
          affiliate_url: string;
          image_url?: string | null;
          category?: string | null;
          tags?: string[] | null;
          commission_rate?: number | null;
          rating?: number | null;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          title?: string;
          description?: string | null;
          price?: number | null;
          currency?: string;
          affiliate_url?: string;
          image_url?: string | null;
          category?: string | null;
          tags?: string[] | null;
          commission_rate?: number | null;
          rating?: number | null;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
      };
      categories: {
        Row: {
          id: string;
          user_id: string;
          name: string;
          color: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          name: string;
          color?: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          name?: string;
          color?: string;
          created_at?: string;
        };
      };
      affiliate_ids: {
        Row: {
          id: string;
          user_id: string;
          platform: string;
          affiliate_id: string;
          is_active: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          platform: string;
          affiliate_id: string;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          platform?: string;
          affiliate_id?: string;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
      };
      analytics: {
        Row: {
          id: string;
          product_id: string;
          user_id: string;
          event_type: 'view' | 'click' | 'conversion';
          visitor_ip: string | null;
          user_agent: string | null;
          referrer: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          product_id: string;
          user_id: string;
          event_type: 'view' | 'click' | 'conversion';
          visitor_ip?: string | null;
          user_agent?: string | null;
          referrer?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          product_id?: string;
          user_id?: string;
          event_type?: 'view' | 'click' | 'conversion';
          visitor_ip?: string | null;
          user_agent?: string | null;
          referrer?: string | null;
          created_at?: string;
        };
      };
    };
  };
}

// Helper function to check if pool is available
const ensurePool = () => {
  if (!pool) {
    throw new Error('Database connection not configured. Please set DATABASE_URL environment variable.');
  }
  return pool;
};

// Helper functions for common database operations
export const dbHelpers = {
  // User operations
  async createUserProfile(userId: string, userData: Partial<Database['public']['Tables']['users']['Insert']>) {
    const dbPool = ensurePool();
    const client = await dbPool.connect();
    try {
      const result = await client.query(
        `INSERT INTO users (id, email, username, first_name, last_name, bio, avatar_url, website_url,
         social_links, theme_settings, subscription_plan, is_active, email_verified, created_at, updated_at)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, NOW(), NOW())
         RETURNING *`,
        [
          userId,
          userData.email,
          userData.username || null,
          userData.first_name || null,
          userData.last_name || null,
          userData.bio || null,
          userData.avatar_url || null,
          userData.website_url || null,
          JSON.stringify(userData.social_links || {}),
          JSON.stringify(userData.theme_settings || {}),
          userData.subscription_plan || 'free',
          userData.is_active !== undefined ? userData.is_active : true,
          userData.email_verified || false,
        ]
      );
      return result.rows[0];
    } finally {
      client.release();
    }
  },

  async updateUserProfile(userId: string, userData: Database['public']['Tables']['users']['Update']) {
    const dbPool = ensurePool();
    const client = await dbPool.connect();
    try {
      const updates: string[] = [];
      const values: any[] = [];
      let paramIndex = 1;

      // Build dynamic UPDATE query
      Object.entries(userData).forEach(([key, value]) => {
        if (key !== 'id' && value !== undefined) {
          if (key === 'social_links' || key === 'theme_settings') {
            updates.push(`${key} = $${paramIndex}`);
            values.push(JSON.stringify(value));
          } else {
            updates.push(`${key} = $${paramIndex}`);
            values.push(value);
          }
          paramIndex++;
        }
      });

      updates.push(`updated_at = NOW()`);
      values.push(userId);

      const query = `UPDATE users SET ${updates.join(', ')} WHERE id = $${paramIndex} RETURNING *`;
      const result = await client.query(query, values);
      return result.rows[0];
    } finally {
      client.release();
    }
  },

  async getUserProfile(userId: string) {
    const dbPool = ensurePool();
    const client = await dbPool.connect();
    try {
      const result = await client.query('SELECT * FROM users WHERE id = $1', [userId]);
      return result.rows[0] || null;
    } finally {
      client.release();
    }
  },

  async getUserByEmail(email: string) {
    const dbPool = ensurePool();
    const client = await dbPool.connect();
    try {
      const result = await client.query('SELECT * FROM users WHERE email = $1', [email]);
      return result.rows[0] || null;
    } finally {
      client.release();
    }
  },

  // Product operations
  async createProduct(productData: Database['public']['Tables']['products']['Insert']) {
    const dbPool = ensurePool();
    const client = await dbPool.connect();
    try {
      const result = await client.query(
        `INSERT INTO products (user_id, title, description, price, currency, affiliate_url,
         image_url, category, tags, commission_rate, rating, is_active, created_at, updated_at)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, NOW(), NOW())
         RETURNING *`,
        [
          productData.user_id,
          productData.title,
          productData.description || null,
          productData.price || null,
          productData.currency || 'USD',
          productData.affiliate_url,
          productData.image_url || null,
          productData.category || null,
          productData.tags || [],
          productData.commission_rate || null,
          productData.rating || null,
          productData.is_active !== undefined ? productData.is_active : true,
        ]
      );
      return result.rows[0];
    } finally {
      client.release();
    }
  },

  async getUserProducts(userId: string) {
    const dbPool = ensurePool();
    const client = await dbPool.connect();
    try {
      const result = await client.query(
        'SELECT * FROM products WHERE user_id = $1 AND is_active = true ORDER BY created_at DESC',
        [userId]
      );
      return result.rows;
    } finally {
      client.release();
    }
  },

  async updateProduct(productId: string, productData: Database['public']['Tables']['products']['Update']) {
    const dbPool = ensurePool();
    const client = await dbPool.connect();
    try {
      const updates: string[] = [];
      const values: any[] = [];
      let paramIndex = 1;

      Object.entries(productData).forEach(([key, value]) => {
        if (key !== 'id' && value !== undefined) {
          if (key === 'tags') {
            updates.push(`${key} = $${paramIndex}`);
            values.push(value);
          } else {
            updates.push(`${key} = $${paramIndex}`);
            values.push(value);
          }
          paramIndex++;
        }
      });

      updates.push(`updated_at = NOW()`);
      values.push(productId);

      const query = `UPDATE products SET ${updates.join(', ')} WHERE id = $${paramIndex} RETURNING *`;
      const result = await client.query(query, values);
      return result.rows[0];
    } finally {
      client.release();
    }
  },

  async deleteProduct(productId: string) {
    const dbPool = ensurePool();
    const client = await dbPool.connect();
    try {
      const result = await client.query(
        'UPDATE products SET is_active = false WHERE id = $1 RETURNING *',
        [productId]
      );
      return result.rows[0];
    } finally {
      client.release();
    }
  },

  // Analytics operations
  async trackEvent(eventData: Database['public']['Tables']['analytics']['Insert']) {
    const dbPool = ensurePool();
    const client = await dbPool.connect();
    try {
      const result = await client.query(
        `INSERT INTO analytics (product_id, user_id, event_type, visitor_ip, user_agent, referrer, created_at)
         VALUES ($1, $2, $3, $4, $5, $6, NOW())
         RETURNING *`,
        [
          eventData.product_id,
          eventData.user_id,
          eventData.event_type,
          eventData.visitor_ip || null,
          eventData.user_agent || null,
          eventData.referrer || null,
        ]
      );
      return result.rows[0];
    } finally {
      client.release();
    }
  },

  async getProductAnalytics(productId: string) {
    const dbPool = ensurePool();
    const client = await dbPool.connect();
    try {
      const result = await client.query(
        `SELECT
          event_type,
          COUNT(*) as count,
          DATE(created_at) as date
         FROM analytics
         WHERE product_id = $1
         GROUP BY event_type, DATE(created_at)
         ORDER BY date DESC`,
        [productId]
      );
      return result.rows;
    } finally {
      client.release();
    }
  },

  // Affiliate ID operations
  async createAffiliateId(affiliateData: Database['public']['Tables']['affiliate_ids']['Insert']) {
    const dbPool = ensurePool();
    const client = await dbPool.connect();
    try {
      const result = await client.query(
        `INSERT INTO affiliate_ids (user_id, platform, affiliate_id, is_active, created_at, updated_at)
         VALUES ($1, $2, $3, $4, NOW(), NOW())
         ON CONFLICT (user_id, platform)
         DO UPDATE SET affiliate_id = $3, updated_at = NOW()
         RETURNING *`,
        [
          affiliateData.user_id,
          affiliateData.platform,
          affiliateData.affiliate_id,
          affiliateData.is_active !== undefined ? affiliateData.is_active : true,
        ]
      );
      return result.rows[0];
    } finally {
      client.release();
    }
  },

  async getUserAffiliateIds(userId: string) {
    const dbPool = ensurePool();
    const client = await dbPool.connect();
    try {
      const result = await client.query(
        'SELECT * FROM affiliate_ids WHERE user_id = $1 AND is_active = true ORDER BY created_at DESC',
        [userId]
      );
      return result.rows;
    } finally {
      client.release();
    }
  },

  async updateAffiliateId(affiliateIdId: string, affiliateData: Database['public']['Tables']['affiliate_ids']['Update']) {
    const dbPool = ensurePool();
    const client = await dbPool.connect();
    try {
      const updates: string[] = [];
      const values: any[] = [];
      let paramIndex = 1;

      Object.entries(affiliateData).forEach(([key, value]) => {
        if (key !== 'id' && value !== undefined) {
          updates.push(`${key} = $${paramIndex}`);
          values.push(value);
          paramIndex++;
        }
      });

      updates.push(`updated_at = NOW()`);
      values.push(affiliateIdId);

      const query = `UPDATE affiliate_ids SET ${updates.join(', ')} WHERE id = $${paramIndex} RETURNING *`;
      const result = await client.query(query, values);
      return result.rows[0];
    } finally {
      client.release();
    }
  },

  async getAffiliateIdByPlatform(userId: string, platform: string) {
    const dbPool = ensurePool();
    const client = await dbPool.connect();
    try {
      const result = await client.query(
        'SELECT * FROM affiliate_ids WHERE user_id = $1 AND platform = $2 AND is_active = true',
        [userId, platform]
      );
      return result.rows[0] || null;
    } finally {
      client.release();
    }
  },

  async deleteAffiliateId(affiliateIdId: string) {
    const dbPool = ensurePool();
    const client = await dbPool.connect();
    try {
      const result = await client.query(
        'UPDATE affiliate_ids SET is_active = false WHERE id = $1 RETURNING *',
        [affiliateIdId]
      );
      return result.rows[0] || null;
    } finally {
      client.release();
    }
  },

  // SMTP Settings operations
  async getUserSMTPSettings(userId: string) {
    const dbPool = ensurePool();
    const client = await dbPool.connect();
    try {
      const result = await client.query(
        'SELECT * FROM user_smtp_settings WHERE user_id = $1 ORDER BY created_at DESC',
        [userId]
      );
      return result.rows;
    } finally {
      client.release();
    }
  },

  async getActiveSMTPSetting(userId: string) {
    const dbPool = ensurePool();
    const client = await dbPool.connect();
    try {
      const result = await client.query(
        'SELECT * FROM user_smtp_settings WHERE user_id = $1 AND is_active = true LIMIT 1',
        [userId]
      );
      return result.rows[0] || null;
    } finally {
      client.release();
    }
  },

  async createOrUpdateSMTPSetting(
    userId: string,
    provider: string,
    settings: Record<string, any>,
    fromEmail: string,
    fromName?: string
  ) {
    const dbPool = ensurePool();
    const client = await dbPool.connect();
    try {
      const result = await client.query(
        `INSERT INTO user_smtp_settings (user_id, provider, settings, from_email, from_name, updated_at)
         VALUES ($1, $2, $3, $4, $5, NOW())
         ON CONFLICT (user_id, provider)
         DO UPDATE SET 
           settings = EXCLUDED.settings,
           from_email = EXCLUDED.from_email,
           from_name = EXCLUDED.from_name,
           updated_at = NOW()
         RETURNING *`,
        [userId, provider, JSON.stringify(settings), fromEmail, fromName || null]
      );
      return result.rows[0];
    } finally {
      client.release();
    }
  },

  async activateSMTPSetting(userId: string, settingId: string) {
    const dbPool = ensurePool();
    const client = await dbPool.connect();
    try {
      // First, deactivate all settings for this user
      await client.query(
        'UPDATE user_smtp_settings SET is_active = false WHERE user_id = $1',
        [userId]
      );
      // Then activate the specified setting
      const result = await client.query(
        'UPDATE user_smtp_settings SET is_active = true, updated_at = NOW() WHERE id = $1 AND user_id = $2 RETURNING *',
        [settingId, userId]
      );
      return result.rows[0] || null;
    } finally {
      client.release();
    }
  },

  async deleteSMTPSetting(userId: string, provider: string) {
    const dbPool = ensurePool();
    const client = await dbPool.connect();
    try {
      const result = await client.query(
        'DELETE FROM user_smtp_settings WHERE user_id = $1 AND provider = $2 RETURNING *',
        [userId, provider]
      );
      return result.rows[0] || null;
    } finally {
      client.release();
    }
  },
};

// Test connection on module load (only if pool is available)
if (pool) {
  pool.on('connect', () => {
    console.log('✅ Connected to NeonDB');
  });

  pool.on('error', (err) => {
    console.error('❌ Unexpected NeonDB error:', err);
  });
}

export default pool;
