
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Progress } from "@/components/ui/progress";
import { ProductExtractionService, ExtractionProgress } from "@/services/ProductExtractionService";
import { ProductFormData } from "@/types";
import { Loader2, AlertCircle, Zap } from "lucide-react";

interface QuickAddFormProps {
  onProductExtracted: (product: Partial<ProductFormData>) => void;
  onCancel: () => void;
}

export default function QuickAddForm({ onProductExtracted, onCancel }: QuickAddFormProps) {
  const [url, setUrl] = useState("");
  const [isExtracting, setIsExtracting] = useState(false);
  const [progress, setProgress] = useState<ExtractionProgress | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleExtract = async () => {
    if (!url.trim()) return;

    setIsExtracting(true);
    setError(null);
    setProgress(null);

    try {
      const extracted = await ProductExtractionService.extractFromURL(
        url.trim(),
        (progressInfo) => setProgress(progressInfo)
      );

      onProductExtracted(extracted);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to extract product data');
    } finally {
      setIsExtracting(false);
      setProgress(null);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !isExtracting) {
      handleExtract();
    }
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Zap className="h-5 w-5 text-yellow-500" />
          Quick Add Product
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <label htmlFor="product-url" className="text-sm font-medium">
            Product URL *
          </label>
          <Input
            id="product-url"
            type="url"
            placeholder="Paste product URL from Amazon, Flipkart, etc."
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            onKeyPress={handleKeyPress}
            disabled={isExtracting}
          />
          <p className="text-xs text-muted-foreground">
            Supported platforms: Amazon, Flipkart, Myntra, Nykaa, and more
          </p>
        </div>

        {progress && (
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span>{progress.message}</span>
              <span>{progress.progress}%</span>
            </div>
            <Progress value={progress.progress} className="w-full" />
          </div>
        )}

        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <div className="flex gap-3 pt-4">
          <Button
            onClick={handleExtract}
            disabled={!url.trim() || isExtracting}
            className="flex-1"
          >
            {isExtracting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Extracting...
              </>
            ) : (
              <>
                <Zap className="mr-2 h-4 w-4" />
                Extract Product Data
              </>
            )}
          </Button>
          
          <Button variant="outline" onClick={onCancel} disabled={isExtracting}>
            Cancel
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
