import { describe, it, expect, beforeEach, vi } from 'vitest';
import { APIKeyManager } from '../apiKeyManager';

// Mock crypto.subtle
const mockCrypto = {
  subtle: {
    generateKey: vi.fn(),
    exportKey: vi.fn(),
    importKey: vi.fn(),
    encrypt: vi.fn(),
    decrypt: vi.fn(),
  },
  getRandomValues: vi.fn(),
};

Object.defineProperty(global, 'crypto', {
  value: mockCrypto,
  writable: true,
});

// Mock localStorage
const mockLocalStorage = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
};

Object.defineProperty(global, 'localStorage', {
  value: mockLocalStorage,
  writable: true,
});

describe('APIKeyManager', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    
    // Setup default mock implementations
    mockCrypto.subtle.generateKey.mockResolvedValue({});
    mockCrypto.subtle.exportKey.mockResolvedValue(new ArrayBuffer(32));
    mockCrypto.subtle.importKey.mockResolvedValue({});
    mockCrypto.subtle.encrypt.mockResolvedValue(new ArrayBuffer(64));
    mockCrypto.subtle.decrypt.mockResolvedValue(new ArrayBuffer(32));
    mockCrypto.getRandomValues.mockImplementation((arr) => {
      for (let i = 0; i < arr.length; i++) {
        arr[i] = Math.floor(Math.random() * 256);
      }
      return arr;
    });
    
    // Mock TextEncoder/TextDecoder
    global.TextEncoder = vi.fn().mockImplementation(() => ({
      encode: vi.fn().mockImplementation((text) => new Uint8Array(text.length)),
    }));
    
    global.TextDecoder = vi.fn().mockImplementation(() => ({
      decode: vi.fn().mockImplementation((buffer) => 'decoded-text'),
    }));
  });

  describe('getKeys', () => {
    it('should return empty object when no keys stored', async () => {
      mockLocalStorage.getItem.mockReturnValue(null);
      
      const keys = await APIKeyManager.getKeys();
      expect(keys).toEqual({});
    });

    it('should return decrypted keys when stored', async () => {
      mockLocalStorage.getItem.mockReturnValueOnce('[1,2,3,4]'); // encryption key
      mockLocalStorage.getItem.mockReturnValueOnce('{"openai":"encrypted-key"}'); // stored keys
      
      const keys = await APIKeyManager.getKeys();
      expect(keys).toHaveProperty('openai');
    });

    it('should handle corrupt data gracefully', async () => {
      mockLocalStorage.getItem.mockReturnValue('invalid-json');
      
      const keys = await APIKeyManager.getKeys();
      expect(keys).toEqual({});
    });
  });

  describe('setKeys', () => {
    it('should encrypt and store keys', async () => {
      mockLocalStorage.getItem.mockReturnValue(null); // no existing keys
      
      await APIKeyManager.setKeys({ openai: 'sk-test-key' });
      
      expect(mockCrypto.subtle.generateKey).toHaveBeenCalled();
      expect(mockCrypto.subtle.encrypt).toHaveBeenCalled();
      expect(mockLocalStorage.setItem).toHaveBeenCalledWith(
        'shopmatic_api_keys',
        expect.any(String)
      );
    });

    it('should handle encryption errors', async () => {
      mockCrypto.subtle.generateKey.mockRejectedValue(new Error('Crypto error'));
      
      await expect(APIKeyManager.setKeys({ openai: 'sk-test-key' })).rejects.toThrow();
    });
  });

  describe('removeKeys', () => {
    it('should remove both keys and encryption key', () => {
      APIKeyManager.removeKeys();
      
      expect(mockLocalStorage.removeItem).toHaveBeenCalledWith('shopmatic_api_keys');
      expect(mockLocalStorage.removeItem).toHaveBeenCalledWith('shopmatic_encryption_key');
    });
  });

  describe('hasValidKey', () => {
    it('should return true for valid OpenAI key', async () => {
      mockLocalStorage.getItem.mockReturnValueOnce('[1,2,3,4]'); // encryption key
      mockLocalStorage.getItem.mockReturnValueOnce('{"openai":"encrypted-key"}'); // stored keys
      
      // Mock decryption to return valid key
      const mockTextDecoder = new TextDecoder();
      mockTextDecoder.decode = vi.fn().mockReturnValue('sk-test-key-with-sufficient-length');
      
      const isValid = await APIKeyManager.hasValidKey('openai');
      expect(isValid).toBe(true);
    });

    it('should return false for invalid OpenAI key format', async () => {
      mockLocalStorage.getItem.mockReturnValueOnce('[1,2,3,4]'); // encryption key
      mockLocalStorage.getItem.mockReturnValueOnce('{"openai":"encrypted-key"}'); // stored keys
      
      // Mock decryption to return invalid key
      const mockTextDecoder = new TextDecoder();
      mockTextDecoder.decode = vi.fn().mockReturnValue('invalid-key');
      
      const isValid = await APIKeyManager.hasValidKey('openai');
      expect(isValid).toBe(false);
    });

    it('should return false when no key exists', async () => {
      mockLocalStorage.getItem.mockReturnValue(null);
      
      const isValid = await APIKeyManager.hasValidKey('openai');
      expect(isValid).toBe(false);
    });

    it('should return true for valid Perplexity key', async () => {
      mockLocalStorage.getItem.mockReturnValueOnce('[1,2,3,4]'); // encryption key
      mockLocalStorage.getItem.mockReturnValueOnce('{"perplexity":"encrypted-key"}'); // stored keys
      
      // Mock decryption to return valid key
      const mockTextDecoder = new TextDecoder();
      mockTextDecoder.decode = vi.fn().mockReturnValue('pplx-test-key-with-sufficient-length');
      
      const isValid = await APIKeyManager.hasValidKey('perplexity');
      expect(isValid).toBe(true);
    });

    it('should handle decryption errors', async () => {
      mockLocalStorage.getItem.mockReturnValueOnce('[1,2,3,4]'); // encryption key
      mockLocalStorage.getItem.mockReturnValueOnce('{"openai":"encrypted-key"}'); // stored keys
      mockCrypto.subtle.decrypt.mockRejectedValue(new Error('Decryption error'));
      
      const isValid = await APIKeyManager.hasValidKey('openai');
      expect(isValid).toBe(false);
    });
  });

  describe('getLegacyKeys', () => {
    it('should decode base64 encoded keys', () => {
      const base64Key = btoa('sk-test-key');
      mockLocalStorage.getItem.mockReturnValue(`{"openai":"${base64Key}"}`);
      
      const keys = APIKeyManager.getLegacyKeys();
      expect(keys).toHaveProperty('openai');
      expect(keys.openai).toBe('sk-test-key');
    });

    it('should handle invalid base64 gracefully', () => {
      mockLocalStorage.getItem.mockReturnValue('{"openai":"invalid-base64"}');
      
      const keys = APIKeyManager.getLegacyKeys();
      expect(keys).toEqual({});
    });

    it('should return empty object when no data exists', () => {
      mockLocalStorage.getItem.mockReturnValue(null);
      
      const keys = APIKeyManager.getLegacyKeys();
      expect(keys).toEqual({});
    });
  });
});