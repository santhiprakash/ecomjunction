
import { Product } from "@/types";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ExternalLink, Star } from "lucide-react";

interface ProductListItemProps {
  product: Product;
  onRemove?: (id: string) => void;
}

export default function ProductListItem({ product, onRemove }: ProductListItemProps) {
  return (
    <div className="flex flex-col sm:flex-row border rounded-lg overflow-hidden bg-card hover:shadow-md transition-all">
      <div className="relative h-48 sm:h-auto sm:w-48 md:w-64 flex-shrink-0 overflow-hidden">
        <img 
          src={product.image} 
          alt={product.title} 
          className="h-full w-full object-cover transition-transform hover:scale-105"
        />
        <Badge className="absolute right-2 top-2 bg-white/90 dark:bg-gray-800/90 text-primary shadow-sm backdrop-blur-sm">
          {product.source}
        </Badge>
      </div>
      
      <div className="flex flex-col flex-grow p-4 sm:p-6">
        <div className="flex flex-wrap items-center justify-between gap-4 mb-2">
          <div className="flex items-center gap-1">
            <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
            <span className="text-sm font-medium">{product.rating}</span>
          </div>
          
          <div className="flex flex-wrap gap-1.5">
            {product.tags.map(tag => (
              <Badge
                key={tag}
                variant="secondary"
                className="text-xs px-2.5 py-1 rounded-full bg-primary/10 text-primary hover:bg-primary/20 border-primary/20"
              >
                {tag}
              </Badge>
            ))}
          </div>
        </div>
        
        <h3 className="text-xl font-semibold">{product.title}</h3>
        
        <p className="mt-2 flex-grow text-muted-foreground line-clamp-2 sm:line-clamp-3">
          {product.description}
        </p>
        
        <div className="mt-4 flex items-center justify-between flex-wrap gap-4">
          <span className="font-bold text-lg">
            {product.currency === "INR" ? "₹" : "$"}{product.price.toLocaleString()}
          </span>
          
          <div className="flex gap-2">
            <Button asChild className="shadow-sm">
              <a href={product.link} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1">
                View Product
                <ExternalLink className="h-3 w-3 ml-1" />
              </a>
            </Button>
            
            {onRemove && (
              <Button 
                variant="outline" 
                onClick={() => onRemove(product.id)}
              >
                Remove
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
