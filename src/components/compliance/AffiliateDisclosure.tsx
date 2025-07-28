import { AlertTriangle, Info, ExternalLink } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';

interface AffiliateDisclosureProps {
  variant?: 'banner' | 'inline' | 'modal';
  showIcon?: boolean;
  className?: string;
}

export default function AffiliateDisclosure({ 
  variant = 'banner', 
  showIcon = true, 
  className = '' 
}: AffiliateDisclosureProps) {
  const disclosureText = {
    short: "This post contains affiliate links. We may earn a commission if you make a purchase.",
    medium: "Affiliate Disclosure: This page contains affiliate links. If you click through and make a purchase, we may earn a commission at no additional cost to you.",
    long: "FTC Affiliate Disclosure: This website contains affiliate links, which means we may receive a commission if you click a link and purchase something that we have recommended. Please note that all opinions remain our own. We only recommend products and services we believe will add value to our readers."
  };

  if (variant === 'banner') {
    return (
      <Alert className={`bg-amber-50 border-amber-200 dark:bg-amber-900/20 dark:border-amber-800 ${className}`}>
        {showIcon && <AlertTriangle className="h-4 w-4 text-amber-600 dark:text-amber-400" />}
        <AlertDescription className="text-amber-800 dark:text-amber-200">
          <strong>Affiliate Disclosure:</strong> {disclosureText.medium}
        </AlertDescription>
      </Alert>
    );
  }

  if (variant === 'inline') {
    return (
      <div className={`flex items-start gap-2 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg text-sm ${className}`}>
        {showIcon && <Info className="h-4 w-4 text-gray-600 dark:text-gray-400 mt-0.5 flex-shrink-0" />}
        <div>
          <Badge variant="outline" className="mb-1">
            FTC Disclosure
          </Badge>
          <p className="text-gray-700 dark:text-gray-300">
            {disclosureText.short}
          </p>
        </div>
      </div>
    );
  }

  if (variant === 'modal') {
    return (
      <Card className={className}>
        <CardContent className="pt-6">
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-amber-600 dark:text-amber-400" />
              <h3 className="font-semibold text-lg">FTC Affiliate Disclosure</h3>
            </div>
            
            <div className="space-y-3 text-sm text-gray-700 dark:text-gray-300">
              <p>{disclosureText.long}</p>
              
              <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg">
                <p className="font-medium text-blue-900 dark:text-blue-100 mb-1">
                  What this means for you:
                </p>
                <ul className="space-y-1 text-blue-800 dark:text-blue-200">
                  <li>• Products are recommended based on our genuine opinion</li>
                  <li>• You won't pay any extra if you purchase through our links</li>
                  <li>• We may earn a small commission to support our content</li>
                  <li>• All opinions and reviews remain completely honest</li>
                </ul>
              </div>
              
              <div className="border-t pt-3">
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  This disclosure is in accordance with the Federal Trade Commission's 
                  <a 
                    href="https://www.ftc.gov/tips-advice/business-center/guidance/ftcs-endorsement-guides-what-people-are-asking" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-blue-600 dark:text-blue-400 hover:underline ml-1"
                  >
                    16 CFR, Part 255 guidelines
                    <ExternalLink className="h-3 w-3 inline ml-1" />
                  </a>
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return null;
}

// Product-specific affiliate disclosure
export function ProductAffiliateDisclosure({ 
  productName, 
  className = '' 
}: { 
  productName?: string; 
  className?: string; 
}) {
  return (
    <div className={`bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg p-3 ${className}`}>
      <div className="flex items-start gap-2">
        <AlertTriangle className="h-4 w-4 text-amber-600 dark:text-amber-400 mt-0.5 flex-shrink-0" />
        <div className="text-sm">
          <p className="font-medium text-amber-900 dark:text-amber-100 mb-1">
            Affiliate Link Notice
          </p>
          <p className="text-amber-800 dark:text-amber-200">
            {productName ? (
              <>This link for <strong>{productName}</strong> is an affiliate link. </>
            ) : (
              <>This is an affiliate link. </>
            )}
            We may earn a commission if you make a purchase, at no additional cost to you.
          </p>
        </div>
      </div>
    </div>
  );
}

// Hook to automatically show disclosure based on product links
export function useAffiliateDisclosure() {
  const shouldShowDisclosure = (url: string): boolean => {
    // Common affiliate domains that should trigger disclosure
    const affiliateDomains = [
      'amazon.com',
      'amazon.in',
      'flipkart.com',
      'myntra.com',
      'nykaa.com',
      'ajio.com',
      'tatacliq.com',
      'paytmmall.com'
    ];
    
    // URL parameters that indicate affiliate links
    const affiliateParams = [
      'tag=',
      'ref=',
      'affiliate=',
      'aff=',
      'partner=',
      'referrer=',
      'campaign='
    ];
    
    try {
      const parsedUrl = new URL(url);
      const hostname = parsedUrl.hostname.toLowerCase();
      const fullUrl = url.toLowerCase();
      
      // Check for affiliate domains
      const hasAffiliateDomain = affiliateDomains.some(domain => 
        hostname.includes(domain)
      );
      
      // Check for affiliate parameters
      const hasAffiliateParams = affiliateParams.some(param => 
        fullUrl.includes(param)
      );
      
      return hasAffiliateDomain || hasAffiliateParams;
      
    } catch {
      return false;
    }
  };

  return { shouldShowDisclosure };
}