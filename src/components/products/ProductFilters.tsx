
import { useState, useEffect } from "react";
import { useProducts } from "@/contexts/ProductContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Separator } from "@/components/ui/separator";
import {
  Sheet,
  SheetTrigger,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetFooter
} from "@/components/ui/sheet";
import { FilterIcon, X } from "lucide-react";

export default function ProductFilters() {
  const {
    categories,
    tags,
    filterOptions,
    setFilterOptions,
    filteredProducts
  } = useProducts();
  
  const [tempFilters, setTempFilters] = useState(filterOptions);
  const [priceValues, setPriceValues] = useState<[number, number]>(filterOptions.priceRange);
  const [filteredTags, setFilteredTags] = useState<string[]>(tags);
  
  // Update filtered tags when categories change
  useEffect(() => {
    if (tempFilters.categories.length === 0) {
      setFilteredTags(tags);
    } else {
      // In a real implementation, you would fetch tags related to selected categories
      // For now, we'll simulate this by filtering tags based on category prefix
      const relatedTags = tags.filter(tag => {
        // Show all tags if no category is selected
        if (tempFilters.categories.length === 0) return true;
        
        // This is a simple simulation - in a real app you would have a proper relationship between categories and tags
        return tempFilters.categories.some(cat => 
          tag.toLowerCase().includes(cat.toLowerCase().substring(0, 3))
        );
      });
      setFilteredTags(relatedTags);
    }
  }, [tempFilters.categories, tags]);
  
  const handleCategoryChange = (category: string, checked: boolean) => {
    setTempFilters(prev => {
      if (checked) {
        return { 
          ...prev, 
          categories: [...prev.categories, category] 
        };
      } else {
        return { 
          ...prev, 
          categories: prev.categories.filter(c => c !== category) 
        };
      }
    });
    
    // Apply filters immediately when category changes
    if (checked) {
      setFilterOptions(prev => ({
        ...prev,
        categories: [...prev.categories, category]
      }));
    } else {
      setFilterOptions(prev => ({
        ...prev,
        categories: prev.categories.filter(c => c !== category)
      }));
    }
  };
  
  const handleTagChange = (tag: string, checked: boolean) => {
    setTempFilters(prev => {
      if (checked) {
        return { 
          ...prev, 
          tags: [...prev.tags, tag] 
        };
      } else {
        return { 
          ...prev, 
          tags: prev.tags.filter(t => t !== tag) 
        };
      }
    });
    
    // Apply tag filters immediately
    if (checked) {
      setFilterOptions(prev => ({
        ...prev,
        tags: [...prev.tags, tag]
      }));
    } else {
      setFilterOptions(prev => ({
        ...prev,
        tags: prev.tags.filter(t => t !== tag)
      }));
    }
  };
  
  const handleRatingChange = (rating: number) => {
    setTempFilters(prev => ({ ...prev, rating }));
  };
  
  const handlePriceChange = (values: number[]) => {
    // Ensure we always have exactly two values by using a tuple
    const priceTuple: [number, number] = [values[0], values[1]];
    setPriceValues(priceTuple);
    setTempFilters(prev => ({ ...prev, priceRange: priceTuple }));
  };
  
  const handleApplyFilters = () => {
    setFilterOptions(tempFilters);
  };
  
  const handleClearFilters = () => {
    const clearedFilters = {
      categories: [],
      tags: [],
      priceRange: [0, 10000] as [number, number],
      rating: 0,
    };
    setTempFilters(clearedFilters);
    setPriceValues(clearedFilters.priceRange);
    setFilterOptions(clearedFilters);
  };

  const removeFilter = (type: 'category' | 'tag', value: string) => {
    if (type === 'category') {
      handleCategoryChange(value, false);
    } else {
      handleTagChange(value, false);
    }
  };
  
  const maxPrice = Math.max(...tags.map(tag => 10000));
  
  // Top filters component
  const topFilters = (
    <div className="mb-6">
      {/* Active filters */}
      {(filterOptions.categories.length > 0 || filterOptions.tags.length > 0) && (
        <div className="mb-4">
          <h3 className="text-sm font-medium mb-2">Active Filters:</h3>
          <div className="flex flex-wrap gap-2">
            {filterOptions.categories.map(category => (
              <Badge 
                key={`active-${category}`}
                variant="secondary"
                className="px-3 py-1"
              >
                {category}
                <X 
                  className="ml-1 h-3 w-3 cursor-pointer" 
                  onClick={() => removeFilter('category', category)}
                />
              </Badge>
            ))}
            {filterOptions.tags.map(tag => (
              <Badge 
                key={`active-${tag}`}
                variant="outline"
                className="px-3 py-1"
              >
                {tag}
                <X 
                  className="ml-1 h-3 w-3 cursor-pointer" 
                  onClick={() => removeFilter('tag', tag)}
                />
              </Badge>
            ))}
            {(filterOptions.categories.length > 0 || filterOptions.tags.length > 0) && (
              <Button 
                variant="ghost" 
                size="sm"
                className="text-xs"
                onClick={handleClearFilters}
              >
                Clear All
              </Button>
            )}
          </div>
        </div>
      )}
      
      {/* Categories at the top */}
      <div className="mb-4">
        <h3 className="text-sm font-medium mb-2">Categories:</h3>
        <div className="flex flex-wrap gap-2">
          {categories.map(category => {
            const isSelected = filterOptions.categories.includes(category);
            return (
              <Badge 
                key={category}
                variant={isSelected ? "default" : "outline"}
                className="cursor-pointer px-3 py-1"
                onClick={() => handleCategoryChange(category, !isSelected)}
              >
                {category}
              </Badge>
            );
          })}
        </div>
      </div>
      
      {/* Tags based on selected categories */}
      <div>
        <h3 className="text-sm font-medium mb-2">Tags:</h3>
        <div className="flex flex-wrap gap-2">
          {filteredTags.map(tag => {
            const isSelected = filterOptions.tags.includes(tag);
            return (
              <Badge 
                key={tag}
                variant={isSelected ? "secondary" : "outline"}
                className="cursor-pointer px-3 py-1"
                onClick={() => handleTagChange(tag, !isSelected)}
              >
                {tag}
              </Badge>
            );
          })}
        </div>
      </div>
    </div>
  );
  
  const sidebarFilters = (
    <div className="space-y-6">
      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-medium">Price Range</h3>
          <div className="text-sm">
            ₹{priceValues[0]} - ₹{priceValues[1]}
          </div>
        </div>
        <Slider
          min={0}
          max={maxPrice}
          step={100}
          value={priceValues}
          onValueChange={handlePriceChange}
          className="mb-6"
        />
      </div>
      
      <Separator />
      
      <div>
        <h3 className="text-sm font-medium mb-4">Minimum Rating</h3>
        <div className="flex gap-1">
          {[1, 2, 3, 4, 5].map(rating => (
            <Button
              key={rating}
              variant={tempFilters.rating === rating ? "default" : "outline"}
              size="sm"
              onClick={() => handleRatingChange(rating)}
              className="px-3"
            >
              {rating}
            </Button>
          ))}
        </div>
      </div>
      
      <Separator />
      
      <div className="flex items-center justify-between">
        <Button 
          variant="outline" 
          size="sm"
          onClick={handleClearFilters}
        >
          Clear Filters
        </Button>
        
        <Button 
          size="sm"
          onClick={handleApplyFilters}
        >
          Apply Filters
        </Button>
      </div>
    </div>
  );
  
  // Return both the top filters and sidebar
  return (
    <>
      {/* Top filters for both desktop and mobile */}
      <div className="w-full mb-6">
        {topFilters}
      </div>
      
      {/* Desktop sidebar filters */}
      <div className="hidden md:block sticky top-20 w-full">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold">Additional Filters:</h2>
            <Badge variant="outline">
              {filteredProducts.length} products
            </Badge>
          </div>
          {sidebarFilters}
        </div>
      </div>
      
      {/* Mobile filters */}
      <div className="block md:hidden">
        <Sheet>
          <SheetTrigger asChild>
            <Button variant="outline" size="sm" className="mb-4 w-full">
              <FilterIcon className="mr-2 h-4 w-4" />
              Advanced Filters ({filteredProducts.length})
            </Button>
          </SheetTrigger>
          <SheetContent side="left">
            <SheetHeader>
              <SheetTitle>Filter Products</SheetTitle>
            </SheetHeader>
            <div className="py-6">{sidebarFilters}</div>
          </SheetContent>
        </Sheet>
      </div>
    </>
  );
}
