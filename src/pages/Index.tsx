
import { useProducts } from "@/contexts/ProductContext";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import ProductList from "@/components/products/ProductList";
import ProductFilters from "@/components/products/ProductFilters";
import AddProductForm from "@/components/products/AddProductForm";
import ThemeCustomizer from "@/components/theme/ThemeCustomizer";
import { Button } from "@/components/ui/button";
import { Share2 } from "lucide-react";

export default function Index() {
  const { filteredProducts } = useProducts();

  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      
      <main className="flex-1 bg-gray-50 dark:bg-gray-900">
        <section className="bg-gradient-to-b from-white to-gray-50 dark:from-gray-800 dark:to-gray-900 py-12">
          <div className="container max-w-6xl mx-auto px-4">
            <div className="flex flex-col md:flex-row justify-between items-center gap-6 mb-8">
              <div>
                <h1 className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-brand">
                  Affiliate Products
                </h1>
                <p className="text-muted-foreground mt-2 max-w-lg">
                  Discover and showcase high-converting affiliate products to boost your earnings
                </p>
              </div>
              
              <div className="flex items-center gap-3">
                <ThemeCustomizer />
                
                <Button variant="outline" className="shadow-sm">
                  <Share2 className="mr-2 h-4 w-4" />
                  Share
                </Button>
                
                <AddProductForm />
              </div>
            </div>
            
            {/* Top filters area - categories and active filters */}
            <ProductFilters />
          </div>
        </section>
        
        {/* Product listing section with full width */}
        <section className="py-8 px-4">
          <div className="container max-w-6xl mx-auto">
            <ProductList />
          </div>
        </section>
      </main>
      
      <Footer />
    </div>
  );
}
