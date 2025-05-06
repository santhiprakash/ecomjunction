
import { Link } from "react-router-dom";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Product } from "@/types";
import { ExternalLink, Star } from "lucide-react";

interface ProductCardProps {
  product: Product;
  onRemove?: (id: string) => void;
}

export default function ProductCard({ product, onRemove }: ProductCardProps) {
  return (
    <Card className="overflow-hidden transition-all duration-300 hover:shadow-lg">
      <div className="relative">
        <img 
          src={product.image} 
          alt={product.title}
          className="h-48 w-full object-cover"
        />
        <Badge className="absolute right-2 top-2 bg-white text-primary">
          {product.source}
        </Badge>
      </div>
      
      <CardContent className="pt-4">
        <div className="flex items-center gap-1 mb-2">
          <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
          <span className="text-sm font-medium">{product.rating}</span>
        </div>
        
        <h3 className="font-semibold line-clamp-1">{product.title}</h3>
        
        <p className="mt-2 text-sm text-muted-foreground line-clamp-2">
          {product.description}
        </p>
        
        <div className="mt-3">
          <span className="font-bold text-lg">{product.currency === "INR" ? "₹" : "$"}{product.price.toLocaleString()}</span>
        </div>
        
        <div className="mt-3 flex flex-wrap gap-1">
          {product.tags.slice(0, 2).map(tag => (
            <Badge key={tag} variant="secondary" className="text-xs">
              {tag}
            </Badge>
          ))}
        </div>
      </CardContent>
      
      <CardFooter className="flex justify-between gap-2 pt-0">
        <Button asChild className="flex-1">
          <a href={product.link} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1">
            View Product
            <ExternalLink className="h-3 w-3 ml-1" />
          </a>
        </Button>
        
        {onRemove && (
          <Button 
            variant="outline" 
            size="sm"
            className="flex-shrink-0"
            onClick={() => onRemove(product.id)}
          >
            Remove
          </Button>
        )}
      </CardFooter>
    </Card>
  );
}
