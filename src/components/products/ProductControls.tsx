import { useProducts } from "@/contexts/ProductContext";
import { Button } from "@/components/ui/button";
import { Grid, List } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function ProductControls() {
  const {
    viewMode,
    setViewMode,
    sortOption,
    setSortOption,
  } = useProducts();

  return (
    <div className="flex items-center gap-3">
      <Select
        value={sortOption}
        onValueChange={(value) => setSortOption(value as any)}
      >
        <SelectTrigger className="w-[180px] bg-background">
          <SelectValue placeholder="Sort by" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="newest">Newest</SelectItem>
          <SelectItem value="price-low-high">Price: Low to High</SelectItem>
          <SelectItem value="price-high-low">Price: High to Low</SelectItem>
          <SelectItem value="rating">Rating</SelectItem>
        </SelectContent>
      </Select>

      <div className="flex border rounded-md bg-background">
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
  );
}