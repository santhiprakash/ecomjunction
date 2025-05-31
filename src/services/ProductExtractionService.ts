
import { OpenAIService, ProductExtractionResult } from './OpenAIService';
import { URLParsingService, BasicProductInfo } from './URLParsingService';
import { ProductFormData } from '@/types';

export interface ExtractionProgress {
  step: 'url' | 'scraping' | 'ai' | 'complete';
  message: string;
  progress: number;
}

export class ProductExtractionService {
  static async extractFromURL(
    url: string,
    onProgress?: (progress: ExtractionProgress) => void
  ): Promise<Partial<ProductFormData>> {
    
    try {
      // Step 1: Basic URL validation
      onProgress?.({
        step: 'url',
        message: 'Validating URL...',
        progress: 10
      });

      if (!this.isValidURL(url)) {
        throw new Error('Invalid URL format');
      }

      // Step 2: Basic web scraping
      onProgress?.({
        step: 'scraping',
        message: 'Fetching product page...',
        progress: 30
      });

      const basicInfo = await URLParsingService.fetchBasicInfo(url);

      // Step 3: AI-powered extraction
      onProgress?.({
        step: 'ai',
        message: 'Extracting product details with AI...',
        progress: 60
      });

      let aiExtraction: ProductExtractionResult | null = null;
      
      try {
        // Create content for AI processing
        const content = `
          Title: ${basicInfo.title}
          Description: ${basicInfo.description}
          Price: ${basicInfo.price}
          Source: ${basicInfo.source}
          URL: ${url}
        `;

        aiExtraction = await OpenAIService.extractProductData(url, content);
      } catch (aiError) {
        console.warn('AI extraction failed, using basic extraction:', aiError);
      }

      // Step 4: Combine results
      onProgress?.({
        step: 'complete',
        message: 'Finalizing product data...',
        progress: 100
      });

      const result: Partial<ProductFormData> = {
        link: url,
        source: URLParsingService.getSourceFromURL(url),
        
        // Use AI extraction if available, fallback to basic
        title: aiExtraction?.title || basicInfo.title || '',
        description: aiExtraction?.description || basicInfo.description || '',
        price: aiExtraction?.price || this.extractPrice(basicInfo.price) || 0,
        currency: aiExtraction?.currency || 'INR',
        image: basicInfo.image || '',
        categories: aiExtraction?.categories || [],
        tags: aiExtraction?.tags || [],
      };

      return result;

    } catch (error) {
      console.error('Product extraction failed:', error);
      throw error;
    }
  }

  private static isValidURL(url: string): boolean {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  }

  private static extractPrice(priceText: string): number {
    if (!priceText) return 0;
    
    // Remove currency symbols and extract number
    const numericPrice = priceText.replace(/[^\d.,]/g, '');
    const price = parseFloat(numericPrice.replace(',', ''));
    
    return isNaN(price) ? 0 : price;
  }

  static async isServiceReady(): Promise<{
    ready: boolean;
    missingServices: string[];
  }> {
    const missing: string[] = [];
    
    const openaiAvailable = await OpenAIService.isServiceAvailable();
    if (!openaiAvailable) {
      missing.push('OpenAI API');
    }

    return {
      ready: missing.length === 0,
      missingServices: missing,
    };
  }
}
