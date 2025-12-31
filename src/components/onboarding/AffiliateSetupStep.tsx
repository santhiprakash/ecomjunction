import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Link2, CheckCircle2 } from "lucide-react";
import AffiliateIdManager from "@/components/affiliate/AffiliateIdManager";

interface AffiliateSetupStepProps {
  onNext: () => void;
  onSkip: () => void;
}

export default function AffiliateSetupStep({ onNext, onSkip }: AffiliateSetupStepProps) {
  return (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <div className="mx-auto w-16 h-16 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center">
          <Link2 className="h-8 w-8 text-green-600 dark:text-green-400" />
        </div>
        <h2 className="text-2xl font-bold">Set Up Affiliate IDs</h2>
        <p className="text-muted-foreground">
          Add your affiliate IDs to automatically apply them to product links
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Affiliate Program Setup</CardTitle>
          <CardDescription>
            Shopmatic will automatically inject your affiliate IDs into product URLs from supported platforms
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-3">
            <div className="flex items-start gap-3 p-3 bg-muted rounded-lg">
              <CheckCircle2 className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
              <div>
                <p className="font-medium">Supported Platforms</p>
                <p className="text-sm text-muted-foreground">
                  Amazon Associates, Flipkart, Myntra, Nykaa, and more
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3 p-3 bg-muted rounded-lg">
              <CheckCircle2 className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
              <div>
                <p className="font-medium">Automatic Injection</p>
                <p className="text-sm text-muted-foreground">
                  Your affiliate IDs are automatically added to product links when you add products
                </p>
              </div>
            </div>

            <div className="pt-4 border-t">
              <p className="text-sm font-medium mb-3">Add Your Affiliate IDs:</p>
              <AffiliateIdManager />
            </div>
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

