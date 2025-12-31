import { useState } from "react";
import { useProducts } from "@/contexts/ProductContext";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { ProductFormData } from "@/types";
import { toast } from "sonner";
import { 
  Link2, 
  Sparkles, 
  Edit3, 
  CheckCircle2, 
  Loader2, 
  Image as ImageIcon,
  AlertCircle,
  Zap,
  Crown
} from "lucide-react";
import { APIKeyManager } from "@/utils/apiKeyManager";
import { ProductExtractionService } from "@/services/ProductExtractionService";
import { canAddProduct, getPlanLimits } from "@/utils/featureGating";
import { AffiliateUrlService } from "@/services/AffiliateUrlService";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

type Mode = 'url' | 'manual';

interface SimpleProductAddProps {
  onSuccess?: () => void;
}

export default function SimpleProductAdd({ onSuccess }: SimpleProductAddProps) {
  const { addProduct, categories, products } = useProducts();
  const { user } = useAuth();
  const [mode, setMode] = useState<Mode>('url');
  const [url, setUrl] = useState("");
  const [isExtracting, setIsExtracting] = useState(false);
  const [extractedData, setExtractedData] = useState<Partial<ProductFormData> | null>(null);
  const [formData, setFormData] = useState<Partial<ProductFormData>>({
    title: "",
    description: "",
    price: 0,
    currency: "INR",
    image: "",
    link: "",
    source: "",
    tags: [],
    categories: [],
  });
  const [selectedCategory, setSelectedCategory] = useState("");
  const [selectedTag, setSelectedTag] = useState("");

  const userPlan = user?.plan || 'free';
  const planLimits = getPlanLimits(userPlan);
  const canAdd = canAddProduct(userPlan, products.length);
  const hasApiKey = APIKeyManager.hasValidKey('openai');

  // Plan-based limits
  const maxImages = userPlan === 'free' ? 2 : Infinity;
  const maxDescriptionLength = userPlan === 'free' ? 500 : 2000;

  const handleUrlExtract = async () => {
    if (!url.trim()) {
      toast.error("Please enter a product URL");
      return;
    }

    if (!hasApiKey) {
      toast.error("OpenAI API key is required for AI extraction. Please set it up first.");
      return;
    }

    setIsExtracting(true);
    try {
      const extracted = await ProductExtractionService.extractFromURL(url.trim());
      
      // Apply plan limits
      if (extracted.description && extracted.description.length > maxDescriptionLength) {
        extracted.description = extracted.description.substring(0, maxDescriptionLength) + "...";
      }
      
      // Limit images for free plan
      if (extracted.image && userPlan === 'free') {
        // Keep only the first image URL
        extracted.image = extracted.image.split(',')[0].trim();
      }

      setExtractedData(extracted);
      setFormData({
        ...formData,
        ...extracted,
        link: url.trim(),
      });
      toast.success("Product data extracted successfully! Review and edit if needed.");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to extract product data");
    } finally {
      setIsExtracting(false);
    }
  };

  const handleSubmit = async () => {
    if (!formData.title || !formData.link) {
      toast.error("Title and product link are required");
      return;
    }

    if (!formData.categories || formData.categories.length === 0) {
      toast.error("Please select at least one category");
      return;
    }

    if (!canAdd) {
      toast.error("You've reached your product limit. Please upgrade your plan.");
      return;
    }

    try {
      let finalLink = formData.link;
      
      // Inject affiliate ID if configured
      if (user && !user.isDemo) {
        const affiliateResult = await AffiliateUrlService.injectAffiliateId(user.id, formData.link);
        if (affiliateResult.affiliateUrl !== formData.link) {
          finalLink = affiliateResult.affiliateUrl;
        }
      }

      const productData: ProductFormData = {
        title: formData.title || "",
        description: formData.description || "",
        price: formData.price || 0,
        currency: formData.currency || "INR",
        image: formData.image || "",
        link: finalLink,
        source: formData.source || "Other",
        tags: formData.tags || [],
        categories: formData.categories || [],
      };

      addProduct(productData);
      toast.success("Product added successfully! 🎉");
      
      // Reset form
      setUrl("");
      setFormData({
        title: "",
        description: "",
        price: 0,
        currency: "INR",
        image: "",
        link: "",
        source: "",
        tags: [],
        categories: [],
      });
      setExtractedData(null);
      setSelectedCategory("");
      setSelectedTag("");
      
      onSuccess?.();
    } catch (error) {
      toast.error("Failed to add product");
    }
  };

  const addCategory = () => {
    if (selectedCategory && !formData.categories?.includes(selectedCategory)) {
      setFormData(prev => ({
        ...prev,
        categories: [...(prev.categories || []), selectedCategory],
      }));
      setSelectedCategory("");
    }
  };

  const removeCategory = (cat: string) => {
    setFormData(prev => ({
      ...prev,
      categories: prev.categories?.filter(c => c !== cat) || [],
    }));
  };

  const addTag = () => {
    if (selectedTag && !formData.tags?.includes(selectedTag)) {
      setFormData(prev => ({
        ...prev,
        tags: [...(prev.tags || []), selectedTag],
      }));
      setSelectedTag("");
    }
  };

  const removeTag = (tag: string) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags?.filter(t => t !== tag) || [],
    }));
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Zap className="h-5 w-5 text-primary" />
              Add New Product
            </CardTitle>
            <CardDescription>
              {mode === 'url' 
                ? "Paste a product URL and let AI do the magic ✨"
                : "Fill in the product details manually"
              }
            </CardDescription>
          </div>
          {!hasApiKey && mode === 'url' && (
            <Badge variant="outline" className="text-xs">
              <Crown className="h-3 w-3 mr-1" />
              API Key Required
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        <Tabs value={mode} onValueChange={(v) => setMode(v as Mode)}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="url" className="flex items-center gap-2">
              <Sparkles className="h-4 w-4" />
              AI Quick Add
            </TabsTrigger>
            <TabsTrigger value="manual" className="flex items-center gap-2">
              <Edit3 className="h-4 w-4" />
              Manual Entry
            </TabsTrigger>
          </TabsList>

          <TabsContent value="url" className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="product-url">Product URL</Label>
              <div className="flex gap-2">
                <Input
                  id="product-url"
                  type="url"
                  placeholder="https://www.amazon.in/dp/..."
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  disabled={isExtracting}
                  className="flex-1"
                />
                <Button
                  onClick={handleUrlExtract}
                  disabled={!url.trim() || isExtracting || !hasApiKey}
                  className="min-w-[120px]"
                >
                  {isExtracting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Extracting...
                    </>
                  ) : (
                    <>
                      <Sparkles className="mr-2 h-4 w-4" />
                      Extract
                    </>
                  )}
                </Button>
              </div>
              {!hasApiKey && (
                <Alert>
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    OpenAI API key is required for AI extraction. Set it up in Settings.
                  </AlertDescription>
                </Alert>
              )}
            </div>

            {extractedData && (
              <Alert>
                <CheckCircle2 className="h-4 w-4 text-green-600" />
                <AlertDescription>
                  Product data extracted! Review and edit the details below.
                </AlertDescription>
              </Alert>
            )}
          </TabsContent>

          <TabsContent value="manual" className="space-y-4">
            <Alert>
              <Edit3 className="h-4 w-4" />
              <AlertDescription>
                Fill in all the product details manually. All fields are required.
              </AlertDescription>
            </Alert>
          </TabsContent>
        </Tabs>

        {/* Product Form */}
        <div className="space-y-4 pt-4 border-t">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="title">Product Title *</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                placeholder="Enter product title"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="source">Source Platform</Label>
              <Select
                value={formData.source}
                onValueChange={(value) => setFormData(prev => ({ ...prev, source: value }))}
              >
                <SelectTrigger id="source">
                  <SelectValue placeholder="Select platform" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Amazon">Amazon</SelectItem>
                  <SelectItem value="Flipkart">Flipkart</SelectItem>
                  <SelectItem value="Myntra">Myntra</SelectItem>
                  <SelectItem value="Nykaa">Nykaa</SelectItem>
                  <SelectItem value="Other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">
              Description {userPlan === 'free' && `(Max ${maxDescriptionLength} chars)`} *
            </Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => {
                const value = e.target.value;
                if (value.length <= maxDescriptionLength) {
                  setFormData(prev => ({ ...prev, description: value }));
                }
              }}
              placeholder="Describe the product..."
              rows={4}
              maxLength={maxDescriptionLength}
              required
            />
            <p className="text-xs text-muted-foreground">
              {formData.description?.length || 0} / {maxDescriptionLength} characters
              {userPlan === 'free' && (
                <span className="ml-2">
                  <Crown className="h-3 w-3 inline mr-1" />
                  Upgrade to Pro for longer descriptions
                </span>
              )}
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="price">Price *</Label>
              <Input
                id="price"
                type="number"
                value={formData.price || ""}
                onChange={(e) => setFormData(prev => ({ ...prev, price: parseFloat(e.target.value) || 0 }))}
                placeholder="0.00"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="currency">Currency *</Label>
              <Select
                value={formData.currency}
                onValueChange={(value) => setFormData(prev => ({ ...prev, currency: value as any }))}
              >
                <SelectTrigger id="currency">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="INR">INR (₹)</SelectItem>
                  <SelectItem value="USD">USD ($)</SelectItem>
                  <SelectItem value="EUR">EUR (€)</SelectItem>
                  <SelectItem value="GBP">GBP (£)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="link">Product Link *</Label>
            <Input
              id="link"
              type="url"
              value={formData.link}
              onChange={(e) => setFormData(prev => ({ ...prev, link: e.target.value }))}
              placeholder="https://..."
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="image">
              Image URL {userPlan === 'free' && `(1 image max)`} *
            </Label>
            <Input
              id="image"
              type="url"
              value={formData.image}
              onChange={(e) => setFormData(prev => ({ ...prev, image: e.target.value }))}
              placeholder="https://..."
              required
            />
            {userPlan === 'free' && (
              <p className="text-xs text-muted-foreground">
                <Crown className="h-3 w-3 inline mr-1" />
                Free plan: 1 image. Upgrade to Pro for multiple images.
              </p>
            )}
          </div>

          {/* Categories */}
          <div className="space-y-2">
            <Label>Categories *</Label>
            <div className="flex gap-2">
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger className="flex-1">
                  <SelectValue placeholder="Select or type category" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map(cat => (
                    <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button type="button" onClick={addCategory} disabled={!selectedCategory}>
                Add
              </Button>
            </div>
            <div className="flex flex-wrap gap-2 mt-2">
              {formData.categories?.map(cat => (
                <Badge key={cat} variant="secondary" className="flex items-center gap-1">
                  {cat}
                  <button
                    type="button"
                    onClick={() => removeCategory(cat)}
                    className="ml-1 hover:text-destructive"
                  >
                    ×
                  </button>
                </Badge>
              ))}
            </div>
          </div>

          {/* Tags */}
          <div className="space-y-2">
            <Label>Tags (Optional)</Label>
            <div className="flex gap-2">
              <Input
                value={selectedTag}
                onChange={(e) => setSelectedTag(e.target.value)}
                placeholder="Enter tag"
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    addTag();
                  }
                }}
              />
              <Button type="button" onClick={addTag} disabled={!selectedTag}>
                Add
              </Button>
            </div>
            <div className="flex flex-wrap gap-2 mt-2">
              {formData.tags?.map(tag => (
                <Badge key={tag} variant="outline" className="flex items-center gap-1">
                  {tag}
                  <button
                    type="button"
                    onClick={() => removeTag(tag)}
                    className="ml-1 hover:text-destructive"
                  >
                    ×
                  </button>
                </Badge>
              ))}
            </div>
          </div>

          <div className="flex gap-2 pt-4">
            <Button
              onClick={handleSubmit}
              disabled={!canAdd || !formData.title || !formData.link || !formData.categories?.length}
              className="flex-1"
            >
              <CheckCircle2 className="mr-2 h-4 w-4" />
              Add Product
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

