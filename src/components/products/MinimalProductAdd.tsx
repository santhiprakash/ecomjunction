import { useState } from "react";
import { useProducts } from "@/contexts/ProductContext";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ProductFormData, Product } from "@/types";
import { toast } from "sonner";
import { 
  Link2, 
  Sparkles, 
  Loader2, 
  CheckCircle2,
  X,
  Plus
} from "lucide-react";
import { APIKeyManager } from "@/utils/apiKeyManager";
import { ProductExtractionService } from "@/services/ProductExtractionService";
import { canAddProduct } from "@/utils/featureGating";
import { AffiliateUrlService } from "@/services/AffiliateUrlService";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface MinimalProductAddProps {
  onSuccess?: () => void;
  onCancel?: () => void;
  editingProduct?: Product | null;
}

export default function MinimalProductAdd({ onSuccess, onCancel, editingProduct }: MinimalProductAddProps) {
  const { addProduct, updateProduct, categories, products } = useProducts();
  const { user } = useAuth();
  const [url, setUrl] = useState(editingProduct?.link || "");
  const [description, setDescription] = useState(editingProduct?.description || "");
  const [category, setCategory] = useState(editingProduct?.categories?.[0] || "");
  const [isExtracting, setIsExtracting] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const userPlan = user?.plan || 'free';
  const canAdd = canAddProduct(userPlan, products.length);
  const hasApiKey = APIKeyManager.hasValidKey('openai');

  const handleExtract = async () => {
    if (!url.trim()) {
      toast.error("Please enter a product URL");
      return;
    }

    if (!hasApiKey) {
      toast.info("AI extraction requires API key setup. You can still add the product manually.");
      return;
    }

    setIsExtracting(true);
    try {
      const extracted = await ProductExtractionService.extractFromURL(url.trim());
      
      // Auto-fill description if available
      if (extracted.description) {
        // Limit description length for free plan
        const maxLength = userPlan === 'free' ? 200 : 500;
        setDescription(extracted.description.substring(0, maxLength));
      }
      
      // Auto-detect category if possible
      if (extracted.categories && extracted.categories.length > 0) {
        setCategory(extracted.categories[0]);
      }
      
      toast.success("Product details extracted!");
    } catch (error) {
      toast.error("Could not extract details. Please fill manually.");
    } finally {
      setIsExtracting(false);
    }
  };

  const handleSubmit = async () => {
    if (!url.trim()) {
      toast.error("Product URL is required");
      return;
    }

    if (!category) {
      toast.error("Please select a category");
      return;
    }

    if (!editingProduct && !canAdd) {
      toast.error("You've reached your product limit. Please upgrade your plan.");
      return;
    }

    setIsSubmitting(true);
    try {
      let finalLink = url.trim();
      
      // Inject affiliate ID if configured
      if (user && !user.isDemo) {
        const affiliateResult = await AffiliateUrlService.injectAffiliateId(user.id, finalLink);
        if (affiliateResult.affiliateUrl !== finalLink) {
          finalLink = affiliateResult.affiliateUrl;
        }
      }

      // Extract basic info from URL for title and image (only if not editing)
      let title = editingProduct?.title || "";
      let image = editingProduct?.image || "";
      let source = editingProduct?.source || "Other";
      
      if (!editingProduct) {
        // Try to extract from URL for new products
        if (finalLink.includes("amazon")) {
          source = "Amazon";
          const asinMatch = finalLink.match(/(?:dp|gp\/product|ASIN)\/([A-Z0-9]{10})/i);
          if (asinMatch) {
            title = `Amazon Product ${asinMatch[1]}`;
            image = `https://images-na.ssl-images-amazon.com/images/P/${asinMatch[1]}.jpg`;
          }
        } else if (finalLink.includes("flipkart")) {
          source = "Flipkart";
        } else if (finalLink.includes("myntra")) {
          source = "Myntra";
        } else if (finalLink.includes("nykaa")) {
          source = "Nykaa";
        }

        // If AI extraction didn't provide title, use a default
        if (!title) {
          title = description ? description.substring(0, 50) + "..." : "Product from " + source;
        }
      } else {
        // When editing, preserve existing title and image if URL hasn't changed
        if (editingProduct.link === finalLink) {
          title = editingProduct.title;
          image = editingProduct.image;
        }
      }

      const productData: ProductFormData = {
        title: title,
        description: description || "Check out this great product!",
        price: 0, // Price can be added later via edit
        currency: "INR",
        image: image || "",
        link: finalLink,
        source: source,
        tags: [],
        categories: [category],
      };

      if (editingProduct) {
        // Convert ProductFormData to Product format for update
        updateProduct(editingProduct.id, {
          title: productData.title,
          description: productData.description,
          price: productData.price,
          currency: productData.currency,
          image: productData.image,
          link: productData.link,
          source: productData.source,
          tags: productData.tags,
          categories: productData.categories,
        });
        toast.success("Product updated successfully! 🎉");
      } else {
        addProduct(productData);
        toast.success("Product added successfully! 🎉");
      }
      
      // Reset form
      setUrl("");
      setDescription("");
      setCategory("");
      
      onSuccess?.();
    } catch (error) {
      toast.error("Failed to add product");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card className="border-2">
      <CardContent className="p-6 space-y-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">
            {editingProduct ? "Edit Product" : "Add New Product"}
          </h3>
          {onCancel && (
            <Button variant="ghost" size="icon" onClick={onCancel} className="h-8 w-8">
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>

        <div className="space-y-4">
          {/* Product URL */}
          <div className="space-y-2">
            <Label htmlFor="product-url">Product Link *</Label>
            <div className="flex gap-2">
              <Input
                id="product-url"
                type="url"
                placeholder="https://www.amazon.in/dp/..."
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                disabled={isExtracting || isSubmitting}
                className="flex-1"
              />
              {hasApiKey && (
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleExtract}
                  disabled={!url.trim() || isExtracting || isSubmitting}
                  className="whitespace-nowrap"
                >
                  {isExtracting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Extracting...
                    </>
                  ) : (
                    <>
                      <Sparkles className="mr-2 h-4 w-4" />
                      Auto-fill
                    </>
                  )}
                </Button>
              )}
            </div>
            <p className="text-xs text-muted-foreground">
              Paste the product URL. {hasApiKey && "Click 'Auto-fill' to extract details automatically."}
            </p>
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description">Description (Optional)</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Add a brief description or let AI extract it..."
              rows={3}
              disabled={isSubmitting}
              maxLength={userPlan === 'free' ? 200 : 500}
            />
            <p className="text-xs text-muted-foreground">
              {description.length} / {userPlan === 'free' ? 200 : 500} characters
            </p>
          </div>

          {/* Category */}
          <div className="space-y-2">
            <Label htmlFor="category">Category *</Label>
            <Select value={category} onValueChange={setCategory} disabled={isSubmitting}>
              <SelectTrigger id="category">
                <SelectValue placeholder="Select a category" />
              </SelectTrigger>
              <SelectContent>
                {categories.length > 0 ? (
                  categories.map(cat => (
                    <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                  ))
                ) : (
                  <SelectItem value="" disabled>No categories available. Create one first.</SelectItem>
                )}
              </SelectContent>
            </Select>
          </div>

          {/* Submit Button */}
          <div className="flex gap-2 pt-2">
            <Button
              onClick={handleSubmit}
              disabled={!url.trim() || !category || (!editingProduct && !canAdd) || isSubmitting}
              className="flex-1"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {editingProduct ? "Updating..." : "Adding..."}
                </>
              ) : (
                <>
                  <CheckCircle2 className="mr-2 h-4 w-4" />
                  {editingProduct ? "Update Product" : "Publish Product"}
                </>
              )}
            </Button>
            {onCancel && (
              <Button variant="outline" onClick={onCancel} disabled={isSubmitting}>
                Cancel
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

