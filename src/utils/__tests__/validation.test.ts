import { describe, it, expect, beforeEach } from 'vitest';
import { InputSanitizer, RateLimiter } from '../validation';

describe('InputSanitizer', () => {
  describe('sanitizeText', () => {
    it('should remove HTML tags', () => {
      const input = '<script>alert("xss")</script>Hello World';
      const result = InputSanitizer.sanitizeText(input);
      expect(result).toBe('Hello World');
    });

    it('should remove javascript protocol', () => {
      const input = 'javascript:alert("xss")';
      const result = InputSanitizer.sanitizeText(input);
      expect(result).toBe('alert("xss")');
    });

    it('should remove event handlers', () => {
      const input = 'onclick=alert("xss")';
      const result = InputSanitizer.sanitizeText(input);
      expect(result).toBe('');
    });

    it('should trim whitespace', () => {
      const input = '  Hello World  ';
      const result = InputSanitizer.sanitizeText(input);
      expect(result).toBe('Hello World');
    });
  });

  describe('sanitizeUrl', () => {
    it('should accept valid HTTPS URLs', () => {
      const url = 'https://example.com/product';
      const result = InputSanitizer.sanitizeUrl(url);
      expect(result).toBe(url);
    });

    it('should accept valid HTTP URLs', () => {
      const url = 'http://example.com/product';
      const result = InputSanitizer.sanitizeUrl(url);
      expect(result).toBe(url);
    });

    it('should reject javascript protocol', () => {
      const url = 'javascript:alert("xss")';
      expect(() => InputSanitizer.sanitizeUrl(url)).toThrow('Invalid URL');
    });

    it('should reject invalid URLs', () => {
      const url = 'not-a-url';
      expect(() => InputSanitizer.sanitizeUrl(url)).toThrow('Invalid URL');
    });
  });

  describe('sanitizeStringArray', () => {
    it('should sanitize each string in array', () => {
      const input = ['<script>alert("xss")</script>tag1', 'tag2', 'tag3'];
      const result = InputSanitizer.sanitizeStringArray(input);
      expect(result).toEqual(['tag1', 'tag2', 'tag3']);
    });

    it('should filter out empty strings', () => {
      const input = ['tag1', '', 'tag2', '   ', 'tag3'];
      const result = InputSanitizer.sanitizeStringArray(input);
      expect(result).toEqual(['tag1', 'tag2', 'tag3']);
    });

    it('should limit array size', () => {
      const input = Array(15).fill('tag');
      const result = InputSanitizer.sanitizeStringArray(input);
      expect(result).toHaveLength(10);
    });
  });

  describe('validateProduct', () => {
    it('should validate valid product data', () => {
      const productData = {
        title: 'Test Product',
        description: 'Test Description',
        price: 99.99,
        currency: 'USD',
        image: 'https://example.com/image.jpg',
        link: 'https://example.com/product',
        source: 'Example Store',
        tags: ['tag1', 'tag2'],
        categories: ['category1']
      };

      const result = InputSanitizer.validateProduct(productData);
      expect(result.success).toBe(true);
      expect(result.data).toBeDefined();
    });

    it('should reject invalid product data', () => {
      const productData = {
        title: '',
        description: '',
        price: -1,
        currency: 'INVALID',
        link: 'not-a-url',
        source: '',
        tags: [],
        categories: []
      };

      const result = InputSanitizer.validateProduct(productData);
      expect(result.success).toBe(false);
      expect(result.errors).toBeDefined();
      expect(result.errors?.length).toBeGreaterThan(0);
    });

    it('should sanitize XSS attempts', () => {
      const productData = {
        title: '<script>alert("xss")</script>Clean Title',
        description: 'javascript:alert("xss")Clean Description',
        price: 99.99,
        currency: 'USD',
        link: 'https://example.com/product',
        source: 'Example Store',
        tags: ['<script>tag</script>'],
        categories: ['onclick=alert("xss")category']
      };

      const result = InputSanitizer.validateProduct(productData);
      expect(result.success).toBe(true);
      expect(result.data).toBeDefined();
      
      const sanitizedData = result.data as any;
      expect(sanitizedData.title).toBe('Clean Title');
      expect(sanitizedData.description).toBe('alert("xss")Clean Description');
      expect(sanitizedData.tags).toEqual(['tag']);
      expect(sanitizedData.categories).toEqual(['category']);
    });
  });
});

describe('RateLimiter', () => {
  beforeEach(() => {
    // Clear rate limiter state before each test
    (RateLimiter as any).requests = new Map();
  });

  it('should allow requests within limit', () => {
    const key = 'test-key';
    const result = RateLimiter.isWithinLimit(key, 5, 60000);
    expect(result).toBe(true);
  });

  it('should track multiple requests', () => {
    const key = 'test-key';
    
    // Make 3 requests
    expect(RateLimiter.isWithinLimit(key, 5, 60000)).toBe(true);
    expect(RateLimiter.isWithinLimit(key, 5, 60000)).toBe(true);
    expect(RateLimiter.isWithinLimit(key, 5, 60000)).toBe(true);
    
    // Should still be within limit
    expect(RateLimiter.isWithinLimit(key, 5, 60000)).toBe(true);
  });

  it('should reject requests over limit', () => {
    const key = 'test-key';
    
    // Make 5 requests (at limit)
    for (let i = 0; i < 5; i++) {
      expect(RateLimiter.isWithinLimit(key, 5, 60000)).toBe(true);
    }
    
    // 6th request should be rejected
    expect(RateLimiter.isWithinLimit(key, 5, 60000)).toBe(false);
  });

  it('should return correct remaining requests', () => {
    const key = 'test-key';
    
    expect(RateLimiter.getRemainingRequests(key, 5, 60000)).toBe(5);
    
    RateLimiter.isWithinLimit(key, 5, 60000);
    expect(RateLimiter.getRemainingRequests(key, 5, 60000)).toBe(4);
    
    RateLimiter.isWithinLimit(key, 5, 60000);
    expect(RateLimiter.getRemainingRequests(key, 5, 60000)).toBe(3);
  });

  it('should handle different keys independently', () => {
    const key1 = 'test-key-1';
    const key2 = 'test-key-2';
    
    // Make 5 requests for key1
    for (let i = 0; i < 5; i++) {
      expect(RateLimiter.isWithinLimit(key1, 5, 60000)).toBe(true);
    }
    
    // key1 should be at limit
    expect(RateLimiter.isWithinLimit(key1, 5, 60000)).toBe(false);
    
    // key2 should still be available
    expect(RateLimiter.isWithinLimit(key2, 5, 60000)).toBe(true);
  });
});