
// API Key Management Utility
// Securely stores and manages API keys in localStorage with proper encryption

export interface APIKeys {
  openai?: string;
  perplexity?: string;
}

const STORAGE_KEY = 'shopmatic_api_keys';
const ENCRYPTION_KEY = 'shopmatic_encryption_key';

export class APIKeyManager {
  private static async getEncryptionKey(): Promise<CryptoKey> {
    const stored = localStorage.getItem(ENCRYPTION_KEY);
    
    if (stored) {
      try {
        const keyData = JSON.parse(stored);
        return await crypto.subtle.importKey(
          'raw',
          new Uint8Array(keyData),
          { name: 'AES-GCM' },
          false,
          ['encrypt', 'decrypt']
        );
      } catch {
        // If import fails, generate new key
      }
    }
    
    // Generate new encryption key
    const key = await crypto.subtle.generateKey(
      { name: 'AES-GCM', length: 256 },
      true,
      ['encrypt', 'decrypt']
    );
    
    // Export and store the key
    const keyData = await crypto.subtle.exportKey('raw', key);
    localStorage.setItem(ENCRYPTION_KEY, JSON.stringify(Array.from(new Uint8Array(keyData))));
    
    return key;
  }

  private static async encrypt(text: string): Promise<string> {
    try {
      const key = await this.getEncryptionKey();
      const iv = crypto.getRandomValues(new Uint8Array(12));
      const encoded = new TextEncoder().encode(text);
      
      const ciphertext = await crypto.subtle.encrypt(
        { name: 'AES-GCM', iv },
        key,
        encoded
      );
      
      // Combine IV and ciphertext
      const combined = new Uint8Array(iv.length + ciphertext.byteLength);
      combined.set(iv);
      combined.set(new Uint8Array(ciphertext), iv.length);
      
      return btoa(String.fromCharCode(...combined));
    } catch (error) {
      console.error('Encryption failed:', error);
      throw new Error('Failed to encrypt API key');
    }
  }

  private static async decrypt(encryptedText: string): Promise<string> {
    try {
      const key = await this.getEncryptionKey();
      const combined = new Uint8Array(
        atob(encryptedText).split('').map(char => char.charCodeAt(0))
      );
      
      const iv = combined.slice(0, 12);
      const ciphertext = combined.slice(12);
      
      const decrypted = await crypto.subtle.decrypt(
        { name: 'AES-GCM', iv },
        key,
        ciphertext
      );
      
      return new TextDecoder().decode(decrypted);
    } catch (error) {
      console.error('Decryption failed:', error);
      return '';
    }
  }

  static async getKeys(): Promise<APIKeys> {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (!stored) return {};
      
      const parsed = JSON.parse(stored);
      const keys: APIKeys = {};
      
      if (parsed.openai) {
        keys.openai = await this.decrypt(parsed.openai);
      }
      
      if (parsed.perplexity) {
        keys.perplexity = await this.decrypt(parsed.perplexity);
      }
      
      return keys;
    } catch {
      return {};
    }
  }

  static async setKeys(keys: Partial<APIKeys>): Promise<void> {
    try {
      const existing = await this.getKeys();
      const updated = { ...existing, ...keys };
      
      const toStore: Record<string, string> = {};
      
      if (updated.openai) {
        toStore.openai = await this.encrypt(updated.openai);
      }
      
      if (updated.perplexity) {
        toStore.perplexity = await this.encrypt(updated.perplexity);
      }
      
      localStorage.setItem(STORAGE_KEY, JSON.stringify(toStore));
    } catch (error) {
      console.error('Failed to store API keys:', error);
      throw error;
    }
  }

  static removeKeys(): void {
    localStorage.removeItem(STORAGE_KEY);
    localStorage.removeItem(ENCRYPTION_KEY);
  }

  static async hasValidKey(provider: 'openai' | 'perplexity'): Promise<boolean> {
    try {
      const keys = await this.getKeys();
      const key = keys[provider];
      
      if (!key) return false;
      
      if (provider === 'openai') {
        return key.startsWith('sk-') && key.length > 20;
      }
      
      if (provider === 'perplexity') {
        return key.startsWith('pplx-') && key.length > 20;
      }
      
      return false;
    } catch {
      return false;
    }
  }

  // Legacy method for backward compatibility - will be removed in future versions
  static getLegacyKeys(): APIKeys {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (!stored) return {};
      
      const parsed = JSON.parse(stored);
      const keys: APIKeys = {};
      
      // Try to decrypt using old base64 method for migration
      if (parsed.openai) {
        try {
          keys.openai = atob(parsed.openai);
        } catch {
          // If it fails, it might already be encrypted
        }
      }
      
      if (parsed.perplexity) {
        try {
          keys.perplexity = atob(parsed.perplexity);
        } catch {
          // If it fails, it might already be encrypted
        }
      }
      
      return keys;
    } catch {
      return {};
    }
  }
}
