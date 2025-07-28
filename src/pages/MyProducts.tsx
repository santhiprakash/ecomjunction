
import { useState } from "react";
import { useProducts } from "@/contexts/ProductContext";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import ProductCard from "@/components/products/ProductCard";
import ProductListItem from "@/components/products/ProductListItem";
import AddProductForm from "@/components/products/AddProductForm";
import ThemeCustomizer from "@/components/theme/ThemeCustomizer";
import DemoBanner from "@/components/auth/DemoBanner";
import { toast } from "sonner";
import {
  Grid,
  List,
  Search,
  Filter,
  ChevronDown,
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

export default function MyProducts() {
  const { 
    products, 
    viewMode, 
    setViewMode, 
    removeProduct, 
    sortOption, 
    setSortOption, 
    categories 
  } = useProducts();
  
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  
  const handleRemoveProduct = (id: string) => {
    removeProduct(id);
    toast.success("Product removed successfully");
  };
  
  // Filter products based on search query and selected categories
  const filteredProducts = products.filter(product => {
    // Search filter
    if (searchQuery && 
        !product.title.toLowerCase().includes(searchQuery.toLowerCase()) &&
        !product.description.toLowerCase().includes(searchQuery.toLowerCase())) {
      return false;
    }
    
    // Category filter
    if (selectedCategories.length > 0 && 
        !product.categories.some(cat => selectedCategories.includes(cat))) {
      return false;
    }
    
    return true;
  }).sort((a, b) => {
    switch (sortOption) {
      case "newest":
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      case "price-low-high":
        return a.price - b.price;
      case "price-high-low":
        return b.price - a.price;
      case "rating":
        return b.rating - a.rating;
      default:
        return 0;
    }
  });

  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      
      <main className="flex-1 container py-6">
        <DemoBanner />
        <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-bold">My Products</h1>
            <p className="text-muted-foreground">
              Manage your affiliate product listings
            </p>
          </div>
          
          <div className="flex items-center gap-4">
            <ThemeCustomizer />
            <AddProductForm />
          </div>
        </div>
        
        <div className="mb-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="relative w-full sm:w-64">
            <Input
              placeholder="Search products..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
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
                  Filter
                  <ChevronDown className="h-4 w-4 ml-1" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <div className="px-2 py-1.5 text-sm font-medium">Categories</div>
                <DropdownMenuSeparator />
                {categories.map(category => (
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
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
            
            <Select
              value={sortOption}
              onValueChange={(value) => setSortOption(value as any)}
            >
              <SelectTrigger className="w-full sm:w-40">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="newest">Newest</SelectItem>
                <SelectItem value="price-low-high">Price: Low to High</SelectItem>
                <SelectItem value="price-high-low">Price: High to Low</SelectItem>
                <SelectItem value="rating">Rating</SelectItem>
              </SelectContent>
            </Select>
            
            <div className="flex border rounded-md">
              <Button
                variant={viewMode === "grid" ? "default" : "ghost"}
                size="icon"
                className="rounded-r-none"
                onClick={() => setViewMode("grid")}
              >
                <Grid className="h-4 w-4" />
              </Button>
              <Button
                variant={viewMode === "list" ? "default" : "ghost"}
                size="icon"
                className="rounded-l-none"
                onClick={() => setViewMode("list")}
              >
                <List className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
        
        {filteredProducts.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-12 text-center">
            <div className="rounded-full bg-muted p-4">
              <svg
                className="h-12 w-12 text-muted-foreground"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"
                />
              </svg>
            </div>
            <h3 className="mt-4 text-lg font-semibold">No products found</h3>
            <p className="mt-2 text-sm text-muted-foreground">
              Try adjusting your search or filter to find what you're looking for.
            </p>
            <Button className="mt-4" onClick={() => {
              setSearchQuery("");
              setSelectedCategories([]);
            }}>
              Clear filters
            </Button>
          </div>
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
      </main>
      
      <Footer />
    </div>
  );
}
