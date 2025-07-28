import { supabaseHelpers } from '@/lib/supabase';

export interface AffiliateUrlResult {
  affiliateUrl: string;
  originalUrl: string;
  platform: string;
  affiliateIdUsed?: string;
}

export class AffiliateUrlService {
  /**
   * Inject affiliate ID into a product URL
   */
  static async injectAffiliateId(
    userId: string,
    originalUrl: string
  ): Promise<AffiliateUrlResult> {
    const platform = this.detectPlatform(originalUrl);
    
    if (!platform) {
      return {
        affiliateUrl: originalUrl,
        originalUrl,
        platform: 'unknown'
      };
    }

    try {
      // Get user's affiliate ID for this platform
      const affiliateIdData = await supabaseHelpers.getAffiliateIdByPlatform(userId, platform);
      
      if (!affiliateIdData) {
        return {
          affiliateUrl: originalUrl,
          originalUrl,
          platform
        };
      }

      const affiliateUrl = this.injectAffiliateIdByPlatform(
        originalUrl,
        platform,
        affiliateIdData.affiliate_id
      );

      return {
        affiliateUrl,
        originalUrl,
        platform,
        affiliateIdUsed: affiliateIdData.id
      };
    } catch (error) {
      console.error('Failed to inject affiliate ID:', error);
      return {
        affiliateUrl: originalUrl,
        originalUrl,
        platform
      };
    }
  }

  /**
   * Detect platform from URL
   */
  static detectPlatform(url: string): string | null {
    const urlLower = url.toLowerCase();
    
    if (urlLower.includes('amazon.')) {
      return 'amazon';
    } else if (urlLower.includes('flipkart.com')) {
      return 'flipkart';
    } else if (urlLower.includes('myntra.com')) {
      return 'myntra';
    } else if (urlLower.includes('nykaa.com')) {
      return 'nykaa';
    }
    
    return null;
  }

  /**
   * Inject affiliate ID based on platform
   */
  static injectAffiliateIdByPlatform(
    url: string,
    platform: string,
    affiliateId: string
  ): string {
    switch (platform) {
      case 'amazon':
        return this.injectAmazonAffiliateId(url, affiliateId);
      case 'flipkart':
        return this.injectFlipkartAffiliateId(url, affiliateId);
      case 'myntra':
        return this.injectMyntraAffiliateId(url, affiliateId);
      case 'nykaa':
        return this.injectNykaaAffiliateId(url, affiliateId);
      default:
        return url;
    }
  }

  /**
   * Inject Amazon affiliate ID
   */
  static injectAmazonAffiliateId(url: string, affiliateTag: string): string {
    try {
      const urlObj = new URL(url);
      
      // Remove existing affiliate parameters
      urlObj.searchParams.delete('tag');
      urlObj.searchParams.delete('linkCode');
      urlObj.searchParams.delete('camp');
      urlObj.searchParams.delete('creative');
      urlObj.searchParams.delete('creativeASIN');
      urlObj.searchParams.delete('ascsubtag');
      
      // Add affiliate tag
      urlObj.searchParams.set('tag', affiliateTag);
      
      return urlObj.toString();
    } catch (error) {
      console.error('Failed to inject Amazon affiliate ID:', error);
      return url;
    }
  }

  /**
   * Inject Flipkart affiliate ID
   */
  static injectFlipkartAffiliateId(url: string, affiliateId: string): string {
    try {
      const urlObj = new URL(url);
      
      // Remove existing affiliate parameters
      urlObj.searchParams.delete('affid');
      urlObj.searchParams.delete('affExtParam1');
      urlObj.searchParams.delete('affExtParam2');
      
      // Add affiliate ID
      urlObj.searchParams.set('affid', affiliateId);
      
      return urlObj.toString();
    } catch (error) {
      console.error('Failed to inject Flipkart affiliate ID:', error);
      return url;
    }
  }

  /**
   * Inject Myntra affiliate ID
   */
  static injectMyntraAffiliateId(url: string, affiliateId: string): string {
    try {
      const urlObj = new URL(url);
      
      // Remove existing affiliate parameters
      urlObj.searchParams.delete('utm_source');
      urlObj.searchParams.delete('utm_medium');
      urlObj.searchParams.delete('utm_campaign');
      
      // Add affiliate parameters
      urlObj.searchParams.set('utm_source', 'affiliate');
      urlObj.searchParams.set('utm_medium', affiliateId);
      
      return urlObj.toString();
    } catch (error) {
      console.error('Failed to inject Myntra affiliate ID:', error);
      return url;
    }
  }

  /**
   * Inject Nykaa affiliate ID
   */
  static injectNykaaAffiliateId(url: string, affiliateId: string): string {
    try {
      const urlObj = new URL(url);
      
      // Remove existing affiliate parameters
      urlObj.searchParams.delete('utm_source');
      urlObj.searchParams.delete('utm_medium');
      urlObj.searchParams.delete('utm_campaign');
      
      // Add affiliate parameters
      urlObj.searchParams.set('utm_source', 'affiliate');
      urlObj.searchParams.set('utm_medium', affiliateId);
      
      return urlObj.toString();
    } catch (error) {
      console.error('Failed to inject Nykaa affiliate ID:', error);
      return url;
    }
  }

  /**
   * Bulk process URLs with affiliate IDs
   */
  static async bulkInjectAffiliateIds(
    userId: string,
    urls: string[]
  ): Promise<AffiliateUrlResult[]> {
    const results: AffiliateUrlResult[] = [];
    
    for (const url of urls) {
      const result = await this.injectAffiliateId(userId, url);
      results.push(result);
    }
    
    return results;
  }

  /**
   * Extract product information from URL for bulk import
   */
  static extractProductInfo(url: string): {
    platform: string | null;
    productId: string | null;
    title?: string;
  } {
    const platform = this.detectPlatform(url);
    let productId: string | null = null;
    
    switch (platform) {
      case 'amazon':
        productId = this.extractAmazonASIN(url);
        break;
      case 'flipkart':
        productId = this.extractFlipkartProductId(url);
        break;
      default:
        productId = null;
    }
    
    return {
      platform,
      productId
    };
  }

  /**
   * Extract Amazon ASIN from URL
   */
  static extractAmazonASIN(url: string): string | null {
    const asinRegex = /(?:\/dp\/|\/gp\/product\/|\/ASIN\/|\/asin\/)([A-Z0-9]{10})/i;
    const match = url.match(asinRegex);
    return match ? match[1] : null;
  }

  /**
   * Extract Flipkart product ID from URL
   */
  static extractFlipkartProductId(url: string): string | null {
    const pidRegex = /pid=([A-Z0-9]+)/i;
    const match = url.match(pidRegex);
    return match ? match[1] : null;
  }

  /**
   * Validate affiliate URL format
   */
  static validateAffiliateUrl(url: string, platform: string): boolean {
    try {
      const urlObj = new URL(url);
      
      switch (platform) {
        case 'amazon':
          return urlObj.searchParams.has('tag');
        case 'flipkart':
          return urlObj.searchParams.has('affid');
        case 'myntra':
        case 'nykaa':
          return urlObj.searchParams.has('utm_source') && 
                 urlObj.searchParams.get('utm_source') === 'affiliate';
        default:
          return true;
      }
    } catch (error) {
      return false;
    }
  }
}
