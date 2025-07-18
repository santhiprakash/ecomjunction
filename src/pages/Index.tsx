
import { useProducts } from "@/contexts/ProductContext";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import ProductList from "@/components/products/ProductList";
import ProductFilters from "@/components/products/ProductFilters";
import AddProductForm from "@/components/products/AddProductForm";
import ThemeCustomizer from "@/components/theme/ThemeCustomizer";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Share2, Search, Grid3X3, List, Filter } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useState } from "react";

export default function Index() {
  const { filteredProducts } = useProducts();
  const [searchQuery, setSearchQuery] = useState("");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [selectedCategory, setSelectedCategory] = useState("All Products");

  const categories = [
    "All Products",
    "Electronics", 
    "Fitness",
    "Kitchen",
    "Home & Garden",
    "Fashion"
  ];

  const tags = [
    "Trending", "Best Seller", "New Arrival", "Premium", "Budget-Friendly", 
    "Eco-Friendly", "Tech", "Fitness", "Home", "Kitchen"
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50/30">
      <Header />
      
      <main className="flex-1">
        {/* Hero Section */}
        <section className="bg-gradient-to-r from-blue-600 via-purple-600 to-blue-800 text-white py-16">
          <div className="container max-w-6xl mx-auto px-4">
            <div className="flex flex-col md:flex-row items-center gap-8">
              <div className="flex-shrink-0">
                <div className="w-24 h-24 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm">
                  <div className="w-20 h-20 bg-gradient-to-br from-pink-400 to-purple-500 rounded-full flex items-center justify-center text-white text-2xl font-bold">
                    SJ
                  </div>
                </div>
              </div>
              
              <div className="flex-1 text-center md:text-left">
                <h1 className="text-4xl md:text-5xl font-bold mb-2">
                  @sarahjohnson
                </h1>
                <p className="text-xl text-blue-100 mb-4">
                  Curating the best products for modern living
                </p>
                <div className="flex flex-wrap gap-4 justify-center md:justify-start text-sm">
                  <span className="flex items-center gap-1">
                    <span className="font-semibold">2.4k</span> Products
                  </span>
                  <span className="flex items-center gap-1">
                    <span className="font-semibold">45.2k</span> Followers
                  </span>
                  <span className="flex items-center gap-1">
                    <span className="font-semibold">89%</span> Success Rate
                  </span>
                </div>
              </div>
              
              <div className="flex items-center gap-3">
                <ThemeCustomizer />
                <Button variant="outline" className="bg-white/10 border-white/30 text-white hover:bg-white/20">
                  <Share2 className="mr-2 h-4 w-4" />
                  Share Profile
                </Button>
                <AddProductForm />
              </div>
            </div>
          </div>
        </section>

        {/* Categories Section */}
        <section className="bg-white border-b">
          <div className="container max-w-6xl mx-auto px-4">
            <div className="flex items-center justify-between py-6">
              <div className="flex items-center gap-1 overflow-x-auto">
                {categories.map((category) => (
                  <Button
                    key={category}
                    variant={selectedCategory === category ? "default" : "ghost"}
                    className={`whitespace-nowrap ${
                      selectedCategory === category 
                        ? "bg-blue-600 text-white" 
                        : "text-gray-600 hover:text-blue-600"
                    }`}
                    onClick={() => setSelectedCategory(category)}
                  >
                    {category}
                  </Button>
                ))}
              </div>
              
              {/* Search Bar moved here */}
              <div className="flex-shrink-0 w-80 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Search products..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 bg-white"
                />
              </div>
            </div>
          </div>
        </section>

        {/* Tag Filters Section - Only show when category is selected */}
        {selectedCategory !== "All Products" && (
          <section className="bg-gray-50/50 border-b">
            <div className="container max-w-6xl mx-auto px-4 py-6">
              <div className="flex flex-wrap gap-2">
                {tags.map((tag) => (
                  <Badge
                    key={tag}
                    variant="secondary"
                    className="cursor-pointer hover:bg-blue-100 hover:text-blue-700 transition-colors"
                  >
                    {tag}
                  </Badge>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* Products Section */}
        <section className="py-8">
          <div className="container max-w-6xl mx-auto px-4">
            <ProductFilters />
            <ProductList />
          </div>
        </section>
      </main>
      
      <Footer />
    </div>
  );
}
