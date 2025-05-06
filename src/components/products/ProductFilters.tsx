
import { useState, useEffect } from "react";
import { useProducts } from "@/contexts/ProductContext";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Sheet,
  SheetTrigger,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetFooter
} from "@/components/ui/sheet";
import { Filter, Star } from "lucide-react";
import { cn } from "@/lib/utils";

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
      // Filter tags based on selected categories
      const relatedTags = tags.filter(tag => {
        if (tempFilters.categories.length === 0) return true;
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
      const newCategories = [...filterOptions.categories, category];
      setFilterOptions({
        ...filterOptions,
        categories: newCategories
      });
    } else {
      const newCategories = filterOptions.categories.filter(c => c !== category);
      setFilterOptions({
        ...filterOptions,
        categories: newCategories
      });
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
      const newTags = [...filterOptions.tags, tag];
      setFilterOptions({
        ...filterOptions,
        tags: newTags
      });
    } else {
      const newTags = filterOptions.tags.filter(t => t !== tag);
      setFilterOptions({
        ...filterOptions,
        tags: newTags
      });
    }
  };
  
  const handleRatingChange = (rating: number) => {
    setTempFilters(prev => ({ ...prev, rating }));
  };
  
  const handlePriceChange = (values: number[]) => {
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
  
  // All filters in a modern design
  return (
    <div className="space-y-6">
      {/* Categories as modern pills */}
      <div className="flex flex-wrap gap-2">
        {categories.map(category => {
          const isSelected = filterOptions.categories.includes(category);
          return (
            <Badge 
              key={category}
              variant={isSelected ? "default" : "outline"}
              className={cn(
                "cursor-pointer px-4 py-2 rounded-full text-sm transition-all",
                isSelected ? "bg-primary hover:bg-primary/90" : "hover:bg-accent"
              )}
              onClick={() => handleCategoryChange(category, !isSelected)}
            >
              {category}
            </Badge>
          );
        })}
      </div>
      
      {/* Active filters with clear option */}
      {(filterOptions.categories.length > 0 || filterOptions.tags.length > 0) && (
        <div className="bg-white dark:bg-gray-800 p-3 rounded-lg shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium">Active Filters</h3>
            <Button 
              variant="ghost" 
              size="sm"
              className="h-8 text-xs"
              onClick={handleClearFilters}
            >
              Clear All
            </Button>
          </div>
          
          <div className="flex flex-wrap gap-2">
            {filterOptions.categories.map(category => (
              <Badge 
                key={`active-${category}`}
                variant="secondary"
                className="px-3 py-1 rounded-full"
              >
                {category}
                <button 
                  className="ml-1 h-3 w-3 cursor-pointer" 
                  onClick={() => removeFilter('category', category)}
                  aria-label={`Remove ${category} filter`}
                >
                  ×
                </button>
              </Badge>
            ))}
            {filterOptions.tags.map(tag => (
              <Badge 
                key={`active-${tag}`}
                variant="outline"
                className="px-3 py-1 rounded-full"
              >
                {tag}
                <button 
                  className="ml-1 h-3 w-3 cursor-pointer" 
                  onClick={() => removeFilter('tag', tag)}
                  aria-label={`Remove ${tag} filter`}
                >
                  ×
                </button>
              </Badge>
            ))}
          </div>
        </div>
      )}
      
      {/* Tags based on selected categories */}
      {filteredTags.length > 0 && (
        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm">
          <h3 className="text-sm font-medium mb-3">Popular Tags</h3>
          <div className="flex flex-wrap gap-2">
            {filteredTags.map(tag => {
              const isSelected = filterOptions.tags.includes(tag);
              return (
                <Badge 
                  key={tag}
                  variant={isSelected ? "secondary" : "outline"}
                  className={cn(
                    "cursor-pointer px-3 py-1 rounded-full text-xs transition-all",
                    isSelected ? "bg-secondary hover:bg-secondary/90" : "hover:bg-accent"
                  )}
                  onClick={() => handleTagChange(tag, !isSelected)}
                >
                  {tag}
                </Badge>
              );
            })}
          </div>
        </div>
      )}
      
      {/* Advanced filters sheet for mobile */}
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="px-3 py-1">
            {filteredProducts.length} products
          </Badge>
          
          {filterOptions.rating > 0 && (
            <Badge variant="outline" className="flex items-center gap-1 px-3 py-1">
              <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
              {filterOptions.rating}+
              <button 
                className="ml-1 h-3 w-3 cursor-pointer" 
                onClick={() => setFilterOptions({...filterOptions, rating: 0})}
                aria-label="Clear rating filter"
              >
                ×
              </button>
            </Badge>
          )}
          
          {(filterOptions.priceRange[0] > 0 || filterOptions.priceRange[1] < maxPrice) && (
            <Badge variant="outline" className="px-3 py-1">
              ₹{filterOptions.priceRange[0]} - ₹{filterOptions.priceRange[1]}
              <button 
                className="ml-1 h-3 w-3 cursor-pointer" 
                onClick={() => setFilterOptions({...filterOptions, priceRange: [0, maxPrice] as [number, number]})}
                aria-label="Clear price filter"
              >
                ×
              </button>
            </Badge>
          )}
        </div>
        
        <Sheet>
          <SheetTrigger asChild>
            <Button variant="outline" size="sm" className="gap-2">
              <Filter className="h-4 w-4" />
              Advanced Filters
            </Button>
          </SheetTrigger>
          <SheetContent side="right">
            <SheetHeader>
              <SheetTitle>Advanced Filters</SheetTitle>
            </SheetHeader>
            
            <div className="py-6 space-y-6">
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
                <div className="flex gap-2">
                  {[1, 2, 3, 4, 5].map(rating => (
                    <Button
                      key={rating}
                      variant={tempFilters.rating === rating ? "default" : "outline"}
                      size="sm"
                      onClick={() => handleRatingChange(rating)}
                      className="flex-1 px-0"
                    >
                      {rating}
                    </Button>
                  ))}
                </div>
              </div>
              
              <Separator />
              
              <div className="flex items-center justify-between pt-4">
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={handleClearFilters}
                >
                  Reset
                </Button>
                
                <Button 
                  size="sm"
                  onClick={handleApplyFilters}
                >
                  Apply Filters
                </Button>
              </div>
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </div>
  );
}
