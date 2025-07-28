import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useProducts } from '@/contexts/ProductContext';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { toast } from 'sonner';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Upload,
  Download,
  Check,
  X,
  AlertCircle,
  ExternalLink,
  Loader2
} from 'lucide-react';
import { AffiliateUrlService, AffiliateUrlResult } from '@/services/AffiliateUrlService';
import { ProductExtractionService } from '@/services/ProductExtractionService';
import { ProductFormData } from '@/types';

interface BulkImportResult {
  url: string;
  status: 'pending' | 'processing' | 'success' | 'error';
  product?: Partial<ProductFormData>;
  error?: string;
  affiliateResult?: AffiliateUrlResult;
}

export default function BulkProductImport() {
  const { user } = useAuth();
  const { addProduct } = useProducts();
  const [open, setOpen] = useState(false);
  const [urls, setUrls] = useState('');
  const [results, setResults] = useState<BulkImportResult[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);

  const parseUrls = (input: string): string[] => {
    return input
      .split('\n')
      .map(url => url.trim())
      .filter(url => url && url.startsWith('http'));
  };

  const handleBulkImport = async () => {
    const urlList = parseUrls(urls);
    
    if (urlList.length === 0) {
      toast.error('Please enter at least one valid URL');
      return;
    }

    if (urlList.length > 20) {
      toast.error('Maximum 20 URLs allowed per batch');
      return;
    }

    setIsProcessing(true);
    setProgress(0);
    
    // Initialize results
    const initialResults: BulkImportResult[] = urlList.map(url => ({
      url,
      status: 'pending'
    }));
    setResults(initialResults);

    try {
      for (let i = 0; i < urlList.length; i++) {
        const url = urlList[i];
        
        // Update status to processing
        setResults(prev => prev.map((result, index) => 
          index === i ? { ...result, status: 'processing' } : result
        ));

        try {
          // Step 1: Inject affiliate ID if user has one
          let affiliateResult: AffiliateUrlResult | undefined;
          if (user && !user.isDemo) {
            affiliateResult = await AffiliateUrlService.injectAffiliateId(user.id, url);
          }

          // Step 2: Extract product data
          const productData = await ProductExtractionService.extractFromURL(url);

          // Step 3: Use affiliate URL if available
          const finalUrl = affiliateResult?.affiliateUrl || url;
          
          const completeProductData: Partial<ProductFormData> = {
            ...productData,
            link: finalUrl,
            source: productData.source || AffiliateUrlService.detectPlatform(url) || 'Other'
          };

          // Update result as success
          setResults(prev => prev.map((result, index) => 
            index === i ? {
              ...result,
              status: 'success',
              product: completeProductData,
              affiliateResult
            } : result
          ));

        } catch (error) {
          // Update result as error
          setResults(prev => prev.map((result, index) => 
            index === i ? {
              ...result,
              status: 'error',
              error: error instanceof Error ? error.message : 'Failed to process URL'
            } : result
          ));
        }

        // Update progress
        setProgress(((i + 1) / urlList.length) * 100);
      }

      toast.success(`Processed ${urlList.length} URLs`);
    } catch (error) {
      toast.error('Bulk import failed');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleAddSelectedProducts = async () => {
    const successfulResults = results.filter(r => r.status === 'success' && r.product);
    
    if (successfulResults.length === 0) {
      toast.error('No products to add');
      return;
    }

    try {
      for (const result of successfulResults) {
        if (result.product) {
          // Ensure required fields are present
          const productData: ProductFormData = {
            title: result.product.title || 'Imported Product',
            description: result.product.description || '',
            price: result.product.price || 0,
            currency: result.product.currency || 'INR',
            image: result.product.image || '',
            link: result.product.link || result.url,
            source: result.product.source || 'Other',
            tags: result.product.tags || [],
            categories: result.product.categories || ['Imported']
          };

          addProduct(productData);
        }
      }

      toast.success(`Added ${successfulResults.length} products successfully`);
      setOpen(false);
      setUrls('');
      setResults([]);
    } catch (error) {
      toast.error('Failed to add products');
    }
  };

  const getStatusIcon = (status: BulkImportResult['status']) => {
    switch (status) {
      case 'pending':
        return <div className="w-4 h-4 rounded-full bg-gray-300" />;
      case 'processing':
        return <Loader2 className="w-4 h-4 animate-spin text-blue-500" />;
      case 'success':
        return <Check className="w-4 h-4 text-green-500" />;
      case 'error':
        return <X className="w-4 h-4 text-red-500" />;
    }
  };

  const getStatusColor = (status: BulkImportResult['status']) => {
    switch (status) {
      case 'pending':
        return 'bg-gray-100';
      case 'processing':
        return 'bg-blue-50';
      case 'success':
        return 'bg-green-50';
      case 'error':
        return 'bg-red-50';
    }
  };

  if (user?.isDemo) {
    return (
      <Button variant="outline" disabled className="gap-2">
        <Upload className="h-4 w-4" />
        Bulk Import (Pro Feature)
      </Button>
    );
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="gap-2">
          <Upload className="h-4 w-4" />
          Bulk Import
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[700px] max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Bulk Product Import</DialogTitle>
          <DialogDescription>
            Import multiple products at once. Paste product URLs (one per line) and we'll extract the details automatically.
            Your affiliate IDs will be automatically applied where available.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* URL Input */}
          <div className="space-y-2">
            <Label htmlFor="urls">Product URLs</Label>
            <Textarea
              id="urls"
              placeholder={`Paste product URLs here (one per line):
https://amazon.com/product/...
https://flipkart.com/product/...
https://myntra.com/product/...`}
              value={urls}
              onChange={(e) => setUrls(e.target.value)}
              rows={6}
              disabled={isProcessing}
            />
            <p className="text-xs text-muted-foreground">
              Maximum 20 URLs per batch. Supported platforms: Amazon, Flipkart, Myntra, Nykaa
            </p>
          </div>

          {/* Process Button */}
          {!isProcessing && results.length === 0 && (
            <Button 
              onClick={handleBulkImport}
              disabled={!urls.trim()}
              className="w-full"
            >
              <Upload className="h-4 w-4 mr-2" />
              Process URLs ({parseUrls(urls).length} URLs)
            </Button>
          )}

          {/* Progress */}
          {isProcessing && (
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Processing URLs...</span>
                <span>{Math.round(progress)}%</span>
              </div>
              <Progress value={progress} />
            </div>
          )}

          {/* Results */}
          {results.length > 0 && (
            <div className="space-y-4">
              <h3 className="text-sm font-medium">Import Results</h3>
              <div className="space-y-2 max-h-60 overflow-y-auto">
                {results.map((result, index) => (
                  <Card key={index} className={`p-3 ${getStatusColor(result.status)}`}>
                    <div className="flex items-start gap-3">
                      {getStatusIcon(result.status)}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-xs font-mono truncate">
                            {result.url}
                          </span>
                          {result.affiliateResult?.affiliateIdUsed && (
                            <Badge variant="secondary" className="text-xs">
                              Affiliate ID Applied
                            </Badge>
                          )}
                        </div>
                        {result.product && (
                          <p className="text-sm font-medium truncate">
                            {result.product.title}
                          </p>
                        )}
                        {result.error && (
                          <p className="text-xs text-red-600">
                            {result.error}
                          </p>
                        )}
                      </div>
                    </div>
                  </Card>
                ))}
              </div>

              {/* Summary */}
              <div className="flex justify-between text-sm text-muted-foreground">
                <span>
                  Success: {results.filter(r => r.status === 'success').length} | 
                  Failed: {results.filter(r => r.status === 'error').length}
                </span>
              </div>

              {/* Add Products Button */}
              {!isProcessing && results.some(r => r.status === 'success') && (
                <Button onClick={handleAddSelectedProducts} className="w-full">
                  <Download className="h-4 w-4 mr-2" />
                  Add {results.filter(r => r.status === 'success').length} Products
                </Button>
              )}
            </div>
          )}
        </div>

        <DialogFooter>
          <Button 
            variant="outline" 
            onClick={() => {
              setOpen(false);
              setUrls('');
              setResults([]);
            }}
            disabled={isProcessing}
          >
            {isProcessing ? 'Processing...' : 'Close'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
