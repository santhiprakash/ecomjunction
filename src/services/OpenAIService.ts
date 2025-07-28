
import { APIKeyManager } from '@/utils/apiKeyManager';
import { RateLimiter, InputSanitizer } from '@/utils/validation';

export interface ProductExtractionResult {
  title: string;
  description: string;
  price: number;
  currency: string;
  categories: string[];
  tags: string[];
  confidence: number;
}

export class OpenAIService {
  private static async getApiKey(): Promise<string | null> {
    const keys = await APIKeyManager.getKeys();
    return keys.openai || null;
  }

  static async extractProductData(
    url: string, 
    htmlContent: string
  ): Promise<ProductExtractionResult> {
    // Rate limiting check
    const rateLimitKey = 'openai-extraction';
    if (!RateLimiter.isWithinLimit(rateLimitKey, 20, 60000)) { // 20 requests per minute
      throw new Error('Rate limit exceeded. Please try again later.');
    }
    
    const apiKey = await this.getApiKey();
    
    if (!apiKey) {
      throw new Error('OpenAI API key not configured');
    }
    
    // Sanitize inputs
    const sanitizedUrl = InputSanitizer.sanitizeUrl(url);
    const sanitizedContent = InputSanitizer.sanitizeText(htmlContent);

    const prompt = `
Extract product information from this HTML content and URL. Return ONLY a valid JSON object with this structure:
{
  "title": "Product title",
  "description": "Product description (max 200 chars)",
  "price": number,
  "currency": "INR|USD|EUR|GBP",
  "categories": ["category1", "category2"],
  "tags": ["tag1", "tag2", "tag3"],
  "confidence": number (0-1)
}

URL: ${sanitizedUrl}
HTML Content: ${sanitizedContent.substring(0, 4000)}...

Rules:
- Extract clear, accurate product information
- Use appropriate Indian categories like Electronics, Fashion, Home, Kitchen, Beauty, etc.
- Generate 2-4 relevant tags
- Set confidence based on information quality
- For Indian sites, prefer INR currency
- Keep description concise but informative
`;

    try {
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'gpt-4o-mini',
          messages: [
            {
              role: 'system',
              content: 'You are a product data extraction expert. Return only valid JSON, no additional text.'
            },
            {
              role: 'user',
              content: prompt
            }
          ],
          temperature: 0.1,
          max_tokens: 500,
        }),
      });

      if (!response.ok) {
        throw new Error(`OpenAI API error: ${response.status}`);
      }

      const data = await response.json();
      const content = data.choices[0]?.message?.content;

      if (!content) {
        throw new Error('No response from OpenAI');
      }

      // Parse the JSON response
      const extracted = JSON.parse(content.trim());
      
      // Validate the response structure
      if (!extracted.title || !extracted.description) {
        throw new Error('Incomplete product data extracted');
      }

      // Sanitize extracted data
      const sanitizedTitle = InputSanitizer.sanitizeText(extracted.title || '');
      const sanitizedDescription = InputSanitizer.sanitizeText(extracted.description || '');
      const sanitizedCategories = InputSanitizer.sanitizeStringArray(
        Array.isArray(extracted.categories) ? extracted.categories : []
      );
      const sanitizedTags = InputSanitizer.sanitizeStringArray(
        Array.isArray(extracted.tags) ? extracted.tags : []
      );

      return {
        title: sanitizedTitle,
        description: sanitizedDescription,
        price: extracted.price || 0,
        currency: extracted.currency || 'INR',
        categories: sanitizedCategories,
        tags: sanitizedTags,
        confidence: extracted.confidence || 0.5,
      };

    } catch (error) {
      console.error('OpenAI extraction error:', error);
      throw new Error('Failed to extract product data with AI');
    }
  }

  static async isServiceAvailable(): Promise<boolean> {
    const apiKey = await this.getApiKey();
    if (!apiKey) return false;

    try {
      const response = await fetch('https://api.openai.com/v1/models', {
        headers: {
          'Authorization': `Bearer ${apiKey}`,
        },
      });
      
      return response.ok;
    } catch {
      return false;
    }
  }
}
