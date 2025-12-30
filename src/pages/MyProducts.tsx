import { useState } from "react";
import { useProducts } from "@/contexts/ProductContext";
import { useAuth } from "@/contexts/AuthContext";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import ProductCard from "@/components/products/ProductCard";
import ProductListItem from "@/components/products/ProductListItem";
import AddProductForm from "@/components/products/AddProductForm";
import ThemeCustomizer from "@/components/theme/ThemeCustomizer";
import AffiliateIdManager from "@/components/affiliate/AffiliateIdManager";
import BulkProductImport from "@/components/products/BulkProductImport";
import DemoBanner from "@/components/auth/DemoBanner";
import { toast } from "sonner";
import {
  Grid,
  List,
  Search,
  Filter,
  ChevronDown,
  Plus,
  BarChart3,
  TrendingUp,
  Eye,
  MousePointerClick,
  ShoppingCart,
  Package,
  Tag,
  DollarSign,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuCheckboxItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function MyProducts() {
  const { 
    products, 
    viewMode, 
    setViewMode, 
    removeProduct, 
    sortOption, 
    setSortOption, 
    categories,
    tags
  } = useProducts();
  const { user } = useAuth();
  
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [activeTab, setActiveTab] = useState("all");
  
  const handleRemoveProduct = (id: string) => {
    removeProduct(id);
    toast.success("Product removed successfully");
  };
  
  // Calculate statistics
  const totalProducts = products.length;
  const activeProducts = products.length; // All products are considered active for now
  const totalValue = products.reduce((sum, p) => sum + (p.price || 0), 0);
  const avgRating = products.length > 0 
    ? products.reduce((sum, p) => sum + (p.rating || 0), 0) / products.length 
    : 0;
  
  // Filter products based on search query, categories, and active tab
  const filteredProducts = products.filter(product => {
    // Note: Product type doesn't have isActive, so we'll show all products for now
    // Active tab filter can be implemented when isActive is added to Product type
    
    // Search filter
    if (searchQuery && 
        !product.title.toLowerCase().includes(searchQuery.toLowerCase()) &&
        !product.description?.toLowerCase().includes(searchQuery.toLowerCase())) {
      return false;
    }
    
    // Category filter
    if (selectedCategories.length > 0 && 
        !product.categories?.some(cat => selectedCategories.includes(cat))) {
      return false;
    }
    
    return true;
  }).sort((a, b) => {
    switch (sortOption) {
      case "newest":
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      case "price-low-high":
        return (a.price || 0) - (b.price || 0);
      case "price-high-low":
        return (b.price || 0) - (a.price || 0);
      case "rating":
        return (b.rating || 0) - (a.rating || 0);
      default:
        return 0;
    }
  });

  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      
      <main className="flex-1 container max-w-7xl mx-auto py-6 px-4">
        <DemoBanner />
        
        {/* Header Section */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-bold mb-2">My Products</h1>
            <p className="text-muted-foreground">
              Manage your affiliate product listings and track performance
            </p>
          </div>
          
          <div className="flex items-center gap-2 flex-wrap">
            <AffiliateIdManager />
            <BulkProductImport />
            <ThemeCustomizer />
            <AddProductForm />
          </div>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Products</CardTitle>
              <Package className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalProducts}</div>
              <p className="text-xs text-muted-foreground">
                {activeProducts} active
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Value</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                ${totalValue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </div>
              <p className="text-xs text-muted-foreground">
                Combined product value
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Average Rating</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{avgRating.toFixed(1)}</div>
              <p className="text-xs text-muted-foreground">
                Across all products
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Categories</CardTitle>
              <Tag className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{categories.length}</div>
              <p className="text-xs text-muted-foreground">
                Unique categories
              </p>
            </CardContent>
          </Card>
        </div>
        
        {/* Tabs for filtering - Hidden for now until isActive is added to Product type */}
        {/* <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-6">
          <TabsList>
            <TabsTrigger value="all">All Products ({products.length})</TabsTrigger>
            <TabsTrigger value="active">Active ({activeProducts})</TabsTrigger>
            <TabsTrigger value="inactive">Inactive ({products.length - activeProducts})</TabsTrigger>
          </TabsList>
        </Tabs> */}
        
        {/* Search and Filter Bar */}
        <div className="mb-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="relative w-full sm:w-96">
            <Input
              placeholder="Search products by title or description..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
              <Search className="h-4 w-4 text-muted-foreground" />
            </div>
          </div>
          
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="flex items-center gap-1">
                  <Filter className="h-4 w-4 mr-1" />
                  Categories
                  {selectedCategories.length > 0 && (
                    <Badge variant="secondary" className="ml-1">
                      {selectedCategories.length}
                    </Badge>
                  )}
                  <ChevronDown className="h-4 w-4 ml-1" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <div className="px-2 py-1.5 text-sm font-medium">Filter by Category</div>
                <DropdownMenuSeparator />
                {categories.length > 0 ? (
                  categories.map(category => (
                    <DropdownMenuCheckboxItem
                      key={category}
                      checked={selectedCategories.includes(category)}
                      onCheckedChange={(checked) => {
                        if (checked) {
                          setSelectedCategories(prev => [...prev, category]);
                        } else {
                          setSelectedCategories(prev => 
                            prev.filter(cat => cat !== category)
                          );
                        }
                      }}
                    >
                      {category}
                    </DropdownMenuCheckboxItem>
                  ))
                ) : (
                  <div className="px-2 py-1.5 text-sm text-muted-foreground">
                    No categories available
                  </div>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
            
            <Select
              value={sortOption}
              onValueChange={(value) => setSortOption(value as any)}
            >
              <SelectTrigger className="w-full sm:w-48">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="newest">Newest First</SelectItem>
                <SelectItem value="price-low-high">Price: Low to High</SelectItem>
                <SelectItem value="price-high-low">Price: High to Low</SelectItem>
                <SelectItem value="rating">Highest Rated</SelectItem>
              </SelectContent>
            </Select>
            
            <div className="flex border rounded-md">
              <Button
                variant={viewMode === "grid" ? "default" : "ghost"}
                size="icon"
                className="rounded-r-none"
                onClick={() => setViewMode("grid")}
                title="Grid view"
              >
                <Grid className="h-4 w-4" />
              </Button>
              <Button
                variant={viewMode === "list" ? "default" : "ghost"}
                size="icon"
                className="rounded-l-none"
                onClick={() => setViewMode("list")}
                title="List view"
              >
                <List className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>

        {/* Results count and clear filters */}
        {(searchQuery || selectedCategories.length > 0) && (
          <div className="mb-4 flex items-center justify-between">
            <p className="text-sm text-muted-foreground">
              Showing {filteredProducts.length} of {products.length} products
            </p>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setSearchQuery("");
                setSelectedCategories([]);
              }}
            >
              Clear filters
            </Button>
          </div>
        )}
        
        {/* Products Display */}
        {filteredProducts.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center p-12 text-center">
              <div className="rounded-full bg-muted p-4 mb-4">
                <Package className="h-12 w-12 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-semibold mb-2">No products found</h3>
              <p className="text-sm text-muted-foreground mb-4 max-w-md">
                {searchQuery || selectedCategories.length > 0
                  ? "Try adjusting your search or filter criteria to find what you're looking for."
                  : "Get started by adding your first product. Use the 'Add Product' button above to begin."}
              </p>
              {searchQuery || selectedCategories.length > 0 ? (
                <Button
                  variant="outline"
                  onClick={() => {
                    setSearchQuery("");
                    setSelectedCategories([]);
                  }}
                >
                  Clear filters
                </Button>
              ) : (
                <AddProductForm />
              )}
            </CardContent>
          </Card>
        ) : viewMode === "grid" ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredProducts.map(product => (
              <ProductCard 
                key={product.id} 
                product={product} 
                onRemove={handleRemoveProduct}
              />
            ))}
          </div>
        ) : (
          <div className="space-y-4">
            {filteredProducts.map(product => (
              <ProductListItem 
                key={product.id} 
                product={product} 
                onRemove={handleRemoveProduct}
              />
            ))}
          </div>
        )}

        {/* Pagination or load more could be added here */}
      </main>
      
      <Footer />
    </div>
  );
}
