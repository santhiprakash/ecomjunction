import { z } from 'zod';
import DOMPurify from 'dompurify';

// Validation schemas
export const productSchema = z.object({
  title: z.string()
    .min(1, 'Title is required')
    .max(200, 'Title must be less than 200 characters')
    .refine(val => val.trim().length > 0, 'Title cannot be empty'),
  
  description: z.string()
    .min(1, 'Description is required')
    .max(1000, 'Description must be less than 1000 characters')
    .refine(val => val.trim().length > 0, 'Description cannot be empty'),
  
  price: z.number()
    .min(0, 'Price must be positive')
    .max(1000000, 'Price must be less than 1,000,000'),
  
  currency: z.enum(['USD', 'INR', 'EUR', 'GBP'], {
    errorMap: () => ({ message: 'Invalid currency' })
  }),
  
  image: z.string()
    .url('Invalid image URL')
    .optional()
    .or(z.literal('')),
  
  link: z.string()
    .url('Invalid product URL')
    .refine(val => {
      // Check for suspicious protocols
      const url = new URL(val);
      return ['http:', 'https:'].includes(url.protocol);
    }, 'Only HTTP/HTTPS URLs are allowed'),
  
  source: z.string()
    .min(1, 'Source is required')
    .max(100, 'Source must be less than 100 characters'),
  
  tags: z.array(z.string().max(50, 'Tag must be less than 50 characters'))
    .max(10, 'Maximum 10 tags allowed'),
  
  categories: z.array(z.string().max(50, 'Category must be less than 50 characters'))
    .max(5, 'Maximum 5 categories allowed')
});

export const apiKeySchema = z.object({
  openai: z.string()
    .min(1, 'OpenAI API key is required')
    .regex(/^sk-[a-zA-Z0-9]+$/, 'Invalid OpenAI API key format')
    .optional(),
  
  perplexity: z.string()
    .min(1, 'Perplexity API key is required')
    .regex(/^pplx-[a-zA-Z0-9]+$/, 'Invalid Perplexity API key format')
    .optional(),
});

export const urlSchema = z.string()
  .url('Invalid URL format')
  .refine(val => {
    try {
      const url = new URL(val);
      return ['http:', 'https:'].includes(url.protocol);
    } catch {
      return false;
    }
  }, 'Only HTTP/HTTPS URLs are allowed')
  .refine(val => {
    // Block suspicious domains
    const suspiciousDomains = ['localhost', '127.0.0.1', '0.0.0.0'];
    const url = new URL(val);
    return !suspiciousDomains.includes(url.hostname);
  }, 'Suspicious URL detected');

// Sanitization utilities
export class InputSanitizer {
  /**
   * Sanitizes HTML content to prevent XSS attacks
   */
  static sanitizeHtml(html: string): string {
    return DOMPurify.sanitize(html, {
      ALLOWED_TAGS: ['b', 'i', 'em', 'strong', 'p', 'br'],
      ALLOWED_ATTR: []
    });
  }

  /**
   * Sanitizes plain text input
   */
  static sanitizeText(text: string): string {
    return text
      .replace(/[<>]/g, '') // Remove < and > characters
      .replace(/javascript:/gi, '') // Remove javascript: protocol
      .replace(/on\w+=/gi, '') // Remove event handlers
      .trim();
  }

  /**
   * Sanitizes URL input
   */
  static sanitizeUrl(url: string): string {
    try {
      const parsed = new URL(url);
      // Only allow HTTP/HTTPS protocols
      if (!['http:', 'https:'].includes(parsed.protocol)) {
        throw new Error('Invalid protocol');
      }
      return parsed.toString();
    } catch {
      throw new Error('Invalid URL');
    }
  }

  /**
   * Sanitizes array of strings
   */
  static sanitizeStringArray(arr: string[]): string[] {
    return arr
      .map(item => this.sanitizeText(item))
      .filter(item => item.length > 0)
      .slice(0, 10); // Limit array size
  }

  /**
   * Validates and sanitizes product data
   */
  static validateProduct(data: unknown): { 
    success: boolean; 
    data?: unknown; 
    errors?: string[] 
  } {
    try {
      // Type check and sanitize input data
      const dataObj = data as Record<string, unknown>;
      const sanitizedData = {
        ...dataObj,
        title: this.sanitizeText(String(dataObj.title || '')),
        description: this.sanitizeText(String(dataObj.description || '')),
        source: this.sanitizeText(String(dataObj.source || '')),
        link: this.sanitizeUrl(String(dataObj.link || '')),
        image: dataObj.image ? this.sanitizeUrl(String(dataObj.image)) : '',
        tags: this.sanitizeStringArray(Array.isArray(dataObj.tags) ? dataObj.tags.map(String) : []),
        categories: this.sanitizeStringArray(Array.isArray(dataObj.categories) ? dataObj.categories.map(String) : [])
      };

      // Validate with schema
      const result = productSchema.safeParse(sanitizedData);
      
      if (result.success) {
        return { success: true, data: result.data };
      } else {
        return { 
          success: false, 
          errors: result.error.errors.map(e => e.message) 
        };
      }
    } catch (error) {
      return { 
        success: false, 
        errors: [error instanceof Error ? error.message : 'Validation failed'] 
      };
    }
  }
}

// Rate limiting utility
export class RateLimiter {
  private static requests: Map<string, number[]> = new Map();
  
  /**
   * Check if request is within rate limit
   */
  static isWithinLimit(key: string, maxRequests: number = 10, windowMs: number = 60000): boolean {
    const now = Date.now();
    const windowStart = now - windowMs;
    
    // Get existing requests for this key
    const existingRequests = this.requests.get(key) || [];
    
    // Filter out old requests
    const recentRequests = existingRequests.filter(timestamp => timestamp > windowStart);
    
    // Check if within limit
    if (recentRequests.length >= maxRequests) {
      return false;
    }
    
    // Add current request
    recentRequests.push(now);
    this.requests.set(key, recentRequests);
    
    return true;
  }
  
  /**
   * Get remaining requests for a key
   */
  static getRemainingRequests(key: string, maxRequests: number = 10, windowMs: number = 60000): number {
    const now = Date.now();
    const windowStart = now - windowMs;
    
    const existingRequests = this.requests.get(key) || [];
    const recentRequests = existingRequests.filter(timestamp => timestamp > windowStart);
    
    return Math.max(0, maxRequests - recentRequests.length);
  }
}

// Security headers utility
export class SecurityHeaders {
  /**
   * Get Content Security Policy header value
   */
  static getCSPHeader(): string {
    return [
      "default-src 'self'",
      "script-src 'self' 'unsafe-inline' 'unsafe-eval'",
      "style-src 'self' 'unsafe-inline'",
      "img-src 'self' data: https:",
      "font-src 'self' data:",
      "connect-src 'self' https://api.openai.com",
      "object-src 'none'",
      "base-uri 'self'",
      "form-action 'self'",
      "frame-ancestors 'none'",
      "upgrade-insecure-requests"
    ].join('; ');
  }
}