
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
      
      <main className="flex-1">
        <div className="container py-6">
          <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
            <div>
              <h1 className="text-3xl font-bold">Affiliate Products</h1>
              <p className="text-muted-foreground">
                Showcase and manage your affiliate products
              </p>
            </div>
            
            <div className="flex items-center gap-4">
              <ThemeCustomizer />
              
              <Button variant="outline">
                <Share2 className="mr-2 h-4 w-4" />
                Share Page
              </Button>
              
              <AddProductForm />
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="md:col-span-1">
              <ProductFilters />
            </div>
            
            <div className="md:col-span-3">
              <ProductList />
            </div>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
}
