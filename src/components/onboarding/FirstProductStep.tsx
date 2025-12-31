import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Package, PlusCircle, Sparkles } from "lucide-react";
import AddProductForm from "@/components/products/AddProductForm";

interface FirstProductStepProps {
  onNext: () => void;
  onSkip: () => void;
}

export default function FirstProductStep({ onNext, onSkip }: FirstProductStepProps) {
  return (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <div className="mx-auto w-16 h-16 bg-purple-100 dark:bg-purple-900 rounded-full flex items-center justify-center">
          <Package className="h-8 w-8 text-purple-600 dark:text-purple-400" />
        </div>
        <h2 className="text-2xl font-bold">Add Your First Product</h2>
        <p className="text-muted-foreground">
          Start building your product showcase by adding your first recommendation
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Quick Start Guide</CardTitle>
          <CardDescription>
            You can add products in two ways:
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 border rounded-lg space-y-2">
              <div className="flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-blue-600" />
                <h3 className="font-semibold">Quick Add (AI-Powered)</h3>
              </div>
              <p className="text-sm text-muted-foreground">
                Paste any product URL and let AI extract all the details automatically. Requires OpenAI API key setup.
              </p>
            </div>

            <div className="p-4 border rounded-lg space-y-2">
              <div className="flex items-center gap-2">
                <PlusCircle className="h-5 w-5 text-green-600" />
                <h3 className="font-semibold">Manual Entry</h3>
              </div>
              <p className="text-sm text-muted-foreground">
                Fill in product details manually. Perfect for when you want full control over the information.
              </p>
            </div>
          </div>

          <div className="pt-4 border-t">
            <p className="text-sm font-medium mb-3">Try it now:</p>
            <AddProductForm />
          </div>

          <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
            <p className="text-sm text-muted-foreground">
              <strong>Tip:</strong> You can always add more products later from the "My Products" page. 
              For now, let's add at least one product to see how it works!
            </p>
          </div>
        </CardContent>
      </Card>

      <div className="flex gap-3 justify-center">
        <Button onClick={onNext} size="lg" className="min-w-[120px]">
          Continue
        </Button>
        <Button onClick={onSkip} variant="ghost" size="lg">
          Skip
        </Button>
      </div>
    </div>
  );
}

