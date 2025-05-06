
import { useState } from "react";
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
import { FilterIcon } from "lucide-react";

export default function ProductFilters() {
  const { 
    categories, 
    tags, 
    filterOptions, 
    setFilterOptions, 
    filteredProducts 
  } = useProducts();
  
  const [tempFilters, setTempFilters] = useState(filterOptions);
  const [priceValues, setPriceValues] = useState(filterOptions.priceRange);
  
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
  };
  
  const handleRatingChange = (rating: number) => {
    setTempFilters(prev => ({ ...prev, rating }));
  };
  
  const handlePriceChange = (values: number[]) => {
    setPriceValues([values[0], values[1]]);
    setTempFilters(prev => ({ ...prev, priceRange: [values[0], values[1]] }));
  };
  
  const handleApplyFilters = () => {
    setFilterOptions(tempFilters);
  };
  
  const handleClearFilters = () => {
    const clearedFilters = {
      categories: [],
      tags: [],
      priceRange: [0, 10000],
      rating: 0,
    };
    setTempFilters(clearedFilters);
    setPriceValues(clearedFilters.priceRange);
    setFilterOptions(clearedFilters);
  };
  
  const maxPrice = Math.max(...tags.map(tag => 10000));
  
  const desktopFilters = (
    <div className="space-y-6">
      <div>
        <h3 className="text-sm font-medium mb-4">Categories</h3>
        <div className="space-y-2">
          {categories.map(category => (
            <div key={category} className="flex items-center space-x-2">
              <Checkbox 
                id={`category-${category}`}
                checked={tempFilters.categories.includes(category)}
                onCheckedChange={(checked) => 
                  handleCategoryChange(category, checked === true)
                }
              />
              <label 
                htmlFor={`category-${category}`}
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              >
                {category}
              </label>
            </div>
          ))}
        </div>
      </div>
      
      <Separator />
      
      <div>
        <h3 className="text-sm font-medium mb-4">Tags</h3>
        <div className="flex flex-wrap gap-2">
          {tags.map(tag => {
            const isSelected = tempFilters.tags.includes(tag);
            return (
              <Badge 
                key={tag}
                variant={isSelected ? "default" : "outline"}
                className="cursor-pointer"
                onClick={() => handleTagChange(tag, !isSelected)}
              >
                {tag}
              </Badge>
            );
          })}
        </div>
      </div>
      
      <Separator />
      
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
  
  return (
    <>
      {/* Desktop filters */}
      <div className="hidden md:block sticky top-20 w-full">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold">Filter by Tags:</h2>
            <Badge variant="outline">
              {filteredProducts.length} products
            </Badge>
          </div>
          {desktopFilters}
        </div>
      </div>
      
      {/* Mobile filters */}
      <div className="block md:hidden">
        <Sheet>
          <SheetTrigger asChild>
            <Button variant="outline" size="sm" className="mb-4 w-full">
              <FilterIcon className="mr-2 h-4 w-4" />
              Filters ({filteredProducts.length})
            </Button>
          </SheetTrigger>
          <SheetContent side="left">
            <SheetHeader>
              <SheetTitle>Filter Products</SheetTitle>
            </SheetHeader>
            <div className="py-6">{desktopFilters}</div>
          </SheetContent>
        </Sheet>
      </div>
    </>
  );
}
