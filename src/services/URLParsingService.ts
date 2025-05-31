
export interface BasicProductInfo {
  title: string;
  description: string;
  image: string;
  price: string;
  source: string;
}

export class URLParsingService {
  private static isAmazonURL(url: string): boolean {
    return url.includes('amazon.');
  }

  private static isFlipkartURL(url: string): boolean {
    return url.includes('flipkart.com');
  }

  private static extractAmazonASIN(url: string): string {
    const asinRegex = /(?:\/dp\/|\/gp\/product\/|\/ASIN\/|\/asin\/)([A-Z0-9]{10})/i;
    const match = url.match(asinRegex);
    return match ? match[1] : '';
  }

  static async fetchBasicInfo(url: string): Promise<BasicProductInfo> {
    try {
      // Try to fetch the page content
      const response = await fetch(url, {
        mode: 'cors',
        headers: {
          'User-Agent': 'Mozilla/5.0 (compatible; eComJunction/1.0)',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch page');
      }

      const html = await response.text();
      return this.parseHTML(url, html);
      
    } catch (error) {
      console.warn('CORS/fetch failed, trying basic extraction:', error);
      return this.extractFromURL(url);
    }
  }

  private static parseHTML(url: string, html: string): BasicProductInfo {
    // Create a temporary DOM to parse HTML
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, 'text/html');

    // Extract title
    let title = '';
    title = doc.querySelector('meta[property="og:title"]')?.getAttribute('content') ||
            doc.querySelector('title')?.textContent ||
            doc.querySelector('h1')?.textContent ||
            '';

    // Extract description
    let description = '';
    description = doc.querySelector('meta[property="og:description"]')?.getAttribute('content') ||
                  doc.querySelector('meta[name="description"]')?.getAttribute('content') ||
                  '';

    // Extract image
    let image = '';
    image = doc.querySelector('meta[property="og:image"]')?.getAttribute('content') ||
            doc.querySelector('meta[property="product:image"]')?.getAttribute('content') ||
            '';

    // Extract price (basic regex patterns)
    let price = '';
    const priceSelectors = [
      '.price', '.price-current', '.selling-price', 
      '[data-price]', '.cost', '.amount'
    ];
    
    for (const selector of priceSelectors) {
      const priceEl = doc.querySelector(selector);
      if (priceEl?.textContent) {
        price = priceEl.textContent.trim();
        break;
      }
    }

    // Determine source from URL
    let source = 'Other';
    if (this.isAmazonURL(url)) source = 'Amazon';
    else if (this.isFlipkartURL(url)) source = 'Flipkart';

    return {
      title: title.trim(),
      description: description.trim(),
      image: image,
      price: price,
      source,
    };
  }

  private static extractFromURL(url: string): BasicProductInfo {
    let source = 'Other';
    let image = '';

    if (this.isAmazonURL(url)) {
      source = 'Amazon';
      const asin = this.extractAmazonASIN(url);
      if (asin) {
        image = `https://images-na.ssl-images-amazon.com/images/P/${asin}.jpg`;
      }
    } else if (this.isFlipkartURL(url)) {
      source = 'Flipkart';
    }

    return {
      title: '',
      description: '',
      image,
      price: '',
      source,
    };
  }

  static getSourceFromURL(url: string): string {
    if (this.isAmazonURL(url)) return 'Amazon';
    if (this.isFlipkartURL(url)) return 'Flipkart';
    if (url.includes('myntra.com')) return 'Myntra';
    if (url.includes('nykaa.com')) return 'Nykaa';
    return 'Other';
  }
}
