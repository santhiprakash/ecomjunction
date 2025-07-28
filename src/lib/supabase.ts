import { createClient } from '@supabase/supabase-js';

// Environment variables
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables. Please check your .env.local file.');
}

// Create Supabase client
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
    flowType: 'pkce'
  },
  db: {
    schema: 'public'
  },
  global: {
    headers: {
      'X-Client-Info': 'ecomjunction@1.0.0'
    }
  }
});

// Database types (generated from Supabase)
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
    Views: {
      [_ in never]: never;
    };
    Functions: {
      [_ in never]: never;
    };
    Enums: {
      [_ in never]: never;
    };
  };
}

// Helper functions for common operations
export const supabaseHelpers = {
  // User operations
  async createUserProfile(userId: string, userData: Partial<Database['public']['Tables']['users']['Insert']>) {
    const { data, error } = await supabase
      .from('users')
      .insert({
        id: userId,
        ...userData,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async updateUserProfile(userId: string, userData: Database['public']['Tables']['users']['Update']) {
    const { data, error } = await supabase
      .from('users')
      .update({
        ...userData,
        updated_at: new Date().toISOString(),
      })
      .eq('id', userId)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async getUserProfile(userId: string) {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', userId)
      .single();

    if (error) throw error;
    return data;
  },

  // Product operations
  async createProduct(productData: Database['public']['Tables']['products']['Insert']) {
    const { data, error } = await supabase
      .from('products')
      .insert({
        ...productData,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async getUserProducts(userId: string) {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .eq('user_id', userId)
      .eq('is_active', true)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data;
  },

  async updateProduct(productId: string, productData: Database['public']['Tables']['products']['Update']) {
    const { data, error } = await supabase
      .from('products')
      .update({
        ...productData,
        updated_at: new Date().toISOString(),
      })
      .eq('id', productId)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async deleteProduct(productId: string) {
    const { data, error } = await supabase
      .from('products')
      .update({ is_active: false })
      .eq('id', productId)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  // Analytics operations
  async trackEvent(eventData: Database['public']['Tables']['analytics']['Insert']) {
    const { data, error } = await supabase
      .from('analytics')
      .insert({
        ...eventData,
        created_at: new Date().toISOString(),
      });

    if (error) throw error;
    return data;
  },

  // Affiliate ID operations
  async createAffiliateId(affiliateData: Database['public']['Tables']['affiliate_ids']['Insert']) {
    const { data, error } = await supabase
      .from('affiliate_ids')
      .insert({
        ...affiliateData,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async getUserAffiliateIds(userId: string) {
    const { data, error } = await supabase
      .from('affiliate_ids')
      .select('*')
      .eq('user_id', userId)
      .eq('is_active', true)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data;
  },

  async updateAffiliateId(affiliateIdId: string, affiliateData: Database['public']['Tables']['affiliate_ids']['Update']) {
    const { data, error } = await supabase
      .from('affiliate_ids')
      .update({
        ...affiliateData,
        updated_at: new Date().toISOString(),
      })
      .eq('id', affiliateIdId)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async deleteAffiliateId(affiliateIdId: string) {
    const { data, error } = await supabase
      .from('affiliate_ids')
      .update({ is_active: false })
      .eq('id', affiliateIdId)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async getAffiliateIdByPlatform(userId: string, platform: string) {
    const { data, error } = await supabase
      .from('affiliate_ids')
      .select('*')
      .eq('user_id', userId)
      .eq('platform', platform)
      .eq('is_active', true)
      .single();

    if (error && error.code !== 'PGRST116') throw error; // PGRST116 is "not found"
    return data;
  }
};

export default supabase;
