import { describe, it, expect, beforeEach, vi } from 'vitest';
import { SecurityUtils } from '../security';

// Mock window.location
const mockLocation = {
  protocol: 'https:',
  hostname: 'example.com',
  href: 'https://example.com'
};

Object.defineProperty(window, 'location', {
  value: mockLocation,
  writable: true,
});

// Mock document.createElement
const mockDiv = {
  textContent: '',
  innerHTML: '',
  setAttribute: vi.fn(),
  getAttribute: vi.fn(),
};

Object.defineProperty(document, 'createElement', {
  value: vi.fn().mockImplementation((tag) => {
    if (tag === 'div') {
      return mockDiv;
    }
    return {};
  }),
  writable: true,
});

describe('SecurityUtils', () => {
  beforeEach(() => {
    SecurityUtils.resetNonce();
    mockDiv.textContent = '';
    mockDiv.innerHTML = '';
  });

  describe('generateNonce', () => {
    it('should generate a nonce', () => {
      const nonce = SecurityUtils.generateNonce();
      expect(nonce).toBeTruthy();
      expect(typeof nonce).toBe('string');
      expect(nonce.length).toBeGreaterThan(0);
    });

    it('should return same nonce on multiple calls', () => {
      const nonce1 = SecurityUtils.generateNonce();
      const nonce2 = SecurityUtils.generateNonce();
      expect(nonce1).toBe(nonce2);
    });

    it('should generate different nonce after reset', () => {
      const nonce1 = SecurityUtils.generateNonce();
      SecurityUtils.resetNonce();
      const nonce2 = SecurityUtils.generateNonce();
      expect(nonce1).not.toBe(nonce2);
    });
  });

  describe('validateUrl', () => {
    it('should accept valid HTTPS URLs', () => {
      expect(SecurityUtils.validateUrl('https://example.com')).toBe(true);
      expect(SecurityUtils.validateUrl('https://example.com/path')).toBe(true);
      expect(SecurityUtils.validateUrl('https://subdomain.example.com')).toBe(true);
    });

    it('should accept valid HTTP URLs', () => {
      expect(SecurityUtils.validateUrl('http://example.com')).toBe(true);
      expect(SecurityUtils.validateUrl('http://localhost:3000')).toBe(true);
    });

    it('should reject javascript protocol', () => {
      expect(SecurityUtils.validateUrl('javascript:alert("xss")')).toBe(false);
    });

    it('should reject data protocol', () => {
      expect(SecurityUtils.validateUrl('data:text/html,<script>alert("xss")</script>')).toBe(false);
    });

    it('should reject file protocol', () => {
      expect(SecurityUtils.validateUrl('file:///etc/passwd')).toBe(false);
    });

    it('should reject ftp protocol', () => {
      expect(SecurityUtils.validateUrl('ftp://example.com')).toBe(false);
    });

    it('should reject invalid URLs', () => {
      expect(SecurityUtils.validateUrl('not-a-url')).toBe(false);
      expect(SecurityUtils.validateUrl('')).toBe(false);
      expect(SecurityUtils.validateUrl('://invalid')).toBe(false);
    });
  });

  describe('sanitizeHtml', () => {
    it('should convert HTML to text', () => {
      mockDiv.textContent = 'Plain text';
      mockDiv.innerHTML = 'Plain text';
      
      const result = SecurityUtils.sanitizeHtml('<script>alert("xss")</script>Plain text');
      expect(result).toBe('Plain text');
    });

    it('should handle empty input', () => {
      mockDiv.textContent = '';
      mockDiv.innerHTML = '';
      
      const result = SecurityUtils.sanitizeHtml('');
      expect(result).toBe('');
    });
  });

  describe('sanitizeFormData', () => {
    it('should sanitize string values', () => {
      const input = {
        name: '<script>alert("xss")</script>John',
        email: 'john@example.com',
        bio: 'javascript:alert("xss")'
      };

      const result = SecurityUtils.sanitizeFormData(input);
      
      expect(result.name).toBe('John');
      expect(result.email).toBe('john@example.com');
      expect(result.bio).toBe('alert("xss")');
    });

    it('should sanitize array values', () => {
      const input = {
        tags: ['<script>tag1</script>', 'tag2', 'javascript:tag3'],
        categories: ['cat1', '<iframe>cat2</iframe>']
      };

      const result = SecurityUtils.sanitizeFormData(input);
      
      expect(result.tags).toEqual(['tag1', 'tag2', 'tag3']);
      expect(result.categories).toEqual(['cat1', 'cat2']);
    });

    it('should preserve non-string values', () => {
      const input = {
        age: 25,
        isActive: true,
        metadata: { key: 'value' }
      };

      const result = SecurityUtils.sanitizeFormData(input);
      
      expect(result.age).toBe(25);
      expect(result.isActive).toBe(true);
      expect(result.metadata).toEqual({ key: 'value' });
    });
  });

  describe('isSecureContext', () => {
    it('should return true for HTTPS', () => {
      mockLocation.protocol = 'https:';
      expect(SecurityUtils.isSecureContext()).toBe(true);
    });

    it('should return true for localhost', () => {
      mockLocation.protocol = 'http:';
      mockLocation.hostname = 'localhost';
      expect(SecurityUtils.isSecureContext()).toBe(true);
    });

    it('should return true for 127.0.0.1', () => {
      mockLocation.protocol = 'http:';
      mockLocation.hostname = '127.0.0.1';
      expect(SecurityUtils.isSecureContext()).toBe(true);
    });

    it('should return false for HTTP on other domains', () => {
      mockLocation.protocol = 'http:';
      mockLocation.hostname = 'example.com';
      expect(SecurityUtils.isSecureContext()).toBe(false);
    });
  });

  describe('generateSecureRandom', () => {
    it('should generate random string of specified length', () => {
      const result = SecurityUtils.generateSecureRandom(16);
      expect(result.length).toBe(16);
    });

    it('should generate different strings on multiple calls', () => {
      const result1 = SecurityUtils.generateSecureRandom(32);
      const result2 = SecurityUtils.generateSecureRandom(32);
      expect(result1).not.toBe(result2);
    });

    it('should use default length if not specified', () => {
      const result = SecurityUtils.generateSecureRandom();
      expect(result.length).toBe(32);
    });
  });

  describe('validateCSRFToken', () => {
    it('should return true for non-empty token', () => {
      expect(SecurityUtils.validateCSRFToken('valid-token')).toBe(true);
    });

    it('should return false for empty token', () => {
      expect(SecurityUtils.validateCSRFToken('')).toBe(false);
    });
  });

  describe('getSecurityReport', () => {
    it('should return security report object', () => {
      const report = SecurityUtils.getSecurityReport();
      
      expect(report).toHaveProperty('isSecure');
      expect(report).toHaveProperty('hasCSP');
      expect(report).toHaveProperty('hasNonce');
      expect(report).toHaveProperty('protocol');
      expect(report).toHaveProperty('hostname');
      
      expect(typeof report.isSecure).toBe('boolean');
      expect(typeof report.hasCSP).toBe('boolean');
      expect(typeof report.hasNonce).toBe('boolean');
      expect(typeof report.protocol).toBe('string');
      expect(typeof report.hostname).toBe('string');
    });
  });
});