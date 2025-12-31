import { useState } from "react";
import { useProducts } from "@/contexts/ProductContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Tag, Plus, X, Edit2, Trash2 } from "lucide-react";
import { toast } from "sonner";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const CATEGORY_COLORS = [
  { name: "Blue", value: "#3B82F6" },
  { name: "Green", value: "#10B981" },
  { name: "Purple", value: "#8B5CF6" },
  { name: "Pink", value: "#EC4899" },
  { name: "Orange", value: "#F97316" },
  { name: "Red", value: "#EF4444" },
  { name: "Yellow", value: "#F59E0B" },
  { name: "Teal", value: "#14B8A6" },
];

export default function CategoryManager() {
  const { categories, products, addCategory, removeCategory } = useProducts();
  const [open, setOpen] = useState(false);
  const [newCategory, setNewCategory] = useState("");
  const [selectedColor, setSelectedColor] = useState(CATEGORY_COLORS[0].value);

  // Get category usage counts
  const categoryCounts = categories.reduce((acc, cat) => {
    acc[cat] = products.filter(p => p.categories?.includes(cat)).length;
    return acc;
  }, {} as Record<string, number>);

  const handleAddCategory = () => {
    if (!newCategory.trim()) {
      toast.error("Please enter a category name");
      return;
    }

    if (categories.includes(newCategory.trim())) {
      toast.error("This category already exists");
      return;
    }

    addCategory(newCategory.trim());
    toast.success(`Category "${newCategory.trim()}" added!`);
    setNewCategory("");
    setOpen(false);
  };

  const handleDeleteCategory = (category: string) => {
    const count = categoryCounts[category] || 0;
    if (count > 0) {
      toast.error(`Cannot delete category "${category}" - it's used by ${count} product(s)`);
      return;
    }

    removeCategory(category);
    toast.success(`Category "${category}" deleted!`);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <Tag className="mr-2 h-4 w-4" />
          Manage Categories
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Manage Categories</DialogTitle>
          <DialogDescription>
            Create and organize your product categories. Categories help organize your products and appear on your brand page.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Add New Category */}
          <div className="space-y-3 p-4 border rounded-lg bg-muted/50">
            <Label>Add New Category</Label>
            <div className="flex gap-2">
              <Input
                value={newCategory}
                onChange={(e) => setNewCategory(e.target.value)}
                placeholder="e.g., Electronics, Fashion, Home"
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    handleAddCategory();
                  }
                }}
              />
              <Select value={selectedColor} onValueChange={setSelectedColor}>
                <SelectTrigger className="w-[120px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {CATEGORY_COLORS.map(color => (
                    <SelectItem key={color.value} value={color.value}>
                      <div className="flex items-center gap-2">
                        <div
                          className="w-4 h-4 rounded-full border"
                          style={{ backgroundColor: color.value }}
                        />
                        {color.name}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button onClick={handleAddCategory} disabled={!newCategory.trim()}>
                <Plus className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Existing Categories */}
          <div className="space-y-2">
            <Label>Your Categories ({categories.length})</Label>
            <div className="space-y-2 max-h-[300px] overflow-y-auto">
              {categories.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-4">
                  No categories yet. Create your first category above!
                </p>
              ) : (
                categories.map(category => {
                  const count = categoryCounts[category] || 0;
                  return (
                    <div
                      key={category}
                      className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50"
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className="w-4 h-4 rounded-full"
                          style={{ backgroundColor: selectedColor }}
                        />
                        <div>
                          <div className="font-medium">{category}</div>
                          <div className="text-xs text-muted-foreground">
                            {count} product{count !== 1 ? 's' : ''}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant="secondary">{count}</Badge>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => handleDeleteCategory(category)}
                          disabled={count > 0}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

