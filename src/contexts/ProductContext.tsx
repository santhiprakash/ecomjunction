
import React, { createContext, useState, useContext, useEffect } from "react";
import { Product, FilterOptions, ViewMode, SortOption, ProductFormData } from "@/types";
import { v4 as uuidv4 } from "uuid";

// Mock data for sample products
import { sampleProducts } from "@/data/sampleProducts";

type ProductContextType = {
  products: Product[];
  viewMode: ViewMode;
  sortOption: SortOption;
  filterOptions: FilterOptions;
  filteredProducts: Product[];
  searchQuery: string;
  addProduct: (product: ProductFormData) => void;
  removeProduct: (id: string) => void;
  updateProduct: (id: string, product: Partial<Product>) => void;
  setViewMode: (mode: ViewMode) => void;
  setSortOption: (option: SortOption) => void;
  setFilterOptions: (filters: Partial<FilterOptions>) => void;
  setSearchQuery: (query: string) => void;
  categories: string[];
  tags: string[];
};

const defaultFilterOptions: FilterOptions = {
  categories: [],
  tags: [],
  priceRange: [0, 10000],
  rating: 0,
};

const ProductContext = createContext<ProductContextType | undefined>(undefined);

export const ProductProvider = ({ children }: { children: React.ReactNode }) => {
  const [products, setProducts] = useState<Product[]>(() => {
    const savedProducts = localStorage.getItem("shopmatic-products");
    return savedProducts ? JSON.parse(savedProducts) : sampleProducts;
  });
  
  const [viewMode, setViewMode] = useState<ViewMode>("grid");
  const [sortOption, setSortOption] = useState<SortOption>("newest");
  const [filterOptions, setFilterOptions] = useState<FilterOptions>(defaultFilterOptions);
  const [searchQuery, setSearchQuery] = useState("");

  // Save products to localStorage
  useEffect(() => {
    localStorage.setItem("shopmatic-products", JSON.stringify(products));
  }, [products]);

  // Get all unique categories and tags
  const categories = Array.from(new Set(products.flatMap(p => p.categories)));
  const tags = Array.from(new Set(products.flatMap(p => p.tags)));

  // Apply filters and sorting to products
  const filteredProducts = products
    .filter(product => {
      // Search query
      if (searchQuery && !product.title.toLowerCase().includes(searchQuery.toLowerCase()) && 
          !product.description.toLowerCase().includes(searchQuery.toLowerCase())) {
        return false;
      }
      
      // Categories
      if (filterOptions.categories.length > 0 && 
          !product.categories.some(cat => filterOptions.categories.includes(cat))) {
        return false;
      }
      
      // Tags
      if (filterOptions.tags.length > 0 && 
          !product.tags.some(tag => filterOptions.tags.includes(tag))) {
        return false;
      }
      
      // Price range
      if (product.price < filterOptions.priceRange[0] || 
          product.price > filterOptions.priceRange[1]) {
        return false;
      }
      
      // Rating
      if (product.rating < filterOptions.rating) {
        return false;
      }
      
      return true;
    })
    .sort((a, b) => {
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

  const addProduct = (productData: ProductFormData) => {
    const newProduct: Product = {
      ...productData,
      id: uuidv4(),
      rating: 0,
      createdAt: new Date(),
    };
    
    setProducts([...products, newProduct]);
  };

  const removeProduct = (id: string) => {
    setProducts(products.filter(p => p.id !== id));
  };

  const updateProduct = (id: string, updatedData: Partial<Product>) => {
    setProducts(products.map(p => 
      p.id === id ? { ...p, ...updatedData } : p
    ));
  };

  const handleSetFilterOptions = (newFilters: Partial<FilterOptions>) => {
    setFilterOptions(prev => ({ ...prev, ...newFilters }));
  };

  return (
    <ProductContext.Provider
      value={{
        products,
        viewMode,
        sortOption,
        filterOptions,
        filteredProducts,
        searchQuery,
        addProduct,
        removeProduct,
        updateProduct,
        setViewMode,
        setSortOption,
        setFilterOptions: handleSetFilterOptions,
        setSearchQuery,
        categories,
        tags,
      }}
    >
      {children}
    </ProductContext.Provider>
  );
};

export const useProducts = () => {
  const context = useContext(ProductContext);
  if (context === undefined) {
    throw new Error("useProducts must be used within a ProductProvider");
  }
  return context;
};
