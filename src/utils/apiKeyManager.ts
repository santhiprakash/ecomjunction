
// API Key Management Utility
// Securely stores and manages API keys in localStorage

export interface APIKeys {
  openai?: string;
  perplexity?: string;
}

const STORAGE_KEY = 'shopmatic_api_keys';

export class APIKeyManager {
  private static encrypt(text: string): string {
    // Simple base64 encoding (not true encryption, but obfuscates keys)
    return btoa(text);
  }

  private static decrypt(encodedText: string): string {
    try {
      return atob(encodedText);
    } catch {
      return '';
    }
  }

  static getKeys(): APIKeys {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (!stored) return {};
      
      const parsed = JSON.parse(stored);
      const keys: APIKeys = {};
      
      if (parsed.openai) {
        keys.openai = this.decrypt(parsed.openai);
      }
      
      if (parsed.perplexity) {
        keys.perplexity = this.decrypt(parsed.perplexity);
      }
      
      return keys;
    } catch {
      return {};
    }
  }

  static setKeys(keys: Partial<APIKeys>): void {
    try {
      const existing = this.getKeys();
      const updated = { ...existing, ...keys };
      
      const toStore: any = {};
      
      if (updated.openai) {
        toStore.openai = this.encrypt(updated.openai);
      }
      
      if (updated.perplexity) {
        toStore.perplexity = this.encrypt(updated.perplexity);
      }
      
      localStorage.setItem(STORAGE_KEY, JSON.stringify(toStore));
    } catch (error) {
      console.error('Failed to store API keys:', error);
    }
  }

  static removeKeys(): void {
    localStorage.removeItem(STORAGE_KEY);
  }

  static hasValidKey(provider: 'openai' | 'perplexity'): boolean {
    const keys = this.getKeys();
    const key = keys[provider];
    
    if (!key) return false;
    
    if (provider === 'openai') {
      return key.startsWith('sk-') && key.length > 20;
    }
    
    if (provider === 'perplexity') {
      return key.startsWith('pplx-') && key.length > 20;
    }
    
    return false;
  }
}
