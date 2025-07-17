
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export function DocumentationFeatures() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Platform Features</CardTitle>
        <CardDescription>
          Comprehensive capabilities of the Shopmatic platform
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div>
          <h3 className="text-lg font-semibold">🚀 Quick Add Technology</h3>
          <ul className="list-disc pl-5 space-y-1 mt-2">
            <li>AI-powered product information extraction from URLs</li>
            <li>Support for major e-commerce platforms (Amazon, Flipkart, etc.)</li>
            <li>Automatic price, image, and description detection</li>
            <li>Smart categorization and tagging suggestions</li>
            <li>Bulk URL import capabilities</li>
          </ul>
        </div>
        
        <div>
          <h3 className="text-lg font-semibold">📱 Product Showcase</h3>
          <ul className="list-disc pl-5 space-y-1 mt-2">
            <li>Grid and list view options for product display</li>
            <li>Responsive product cards with key information</li>
            <li>Advanced filtering by tags, categories, price range, and rating</li>
            <li>Real-time search functionality</li>
            <li>Customizable sorting options (newest, price, rating)</li>
          </ul>
        </div>
        
        <div>
          <h3 className="text-lg font-semibold">🎨 Customization</h3>
          <ul className="list-disc pl-5 space-y-1 mt-2">
            <li>Custom color scheme selection</li>
            <li>Light/dark mode toggle</li>
            <li>Personalized showcase layouts</li>
            <li>Custom branding elements</li>
            <li>Mobile-responsive design</li>
          </ul>
        </div>
        
        <div>
          <h3 className="text-lg font-semibold">🏷️ Organization Tools</h3>
          <ul className="list-disc pl-5 space-y-1 mt-2">
            <li>Dynamic category management</li>
            <li>Flexible tagging system</li>
            <li>Product status management</li>
            <li>Bulk operations for efficient management</li>
            <li>Smart product recommendations</li>
          </ul>
        </div>
        
        <div>
          <h3 className="text-lg font-semibold">📊 Analytics (Coming Soon)</h3>
          <ul className="list-disc pl-5 space-y-1 mt-2">
            <li>Click tracking and conversion monitoring</li>
            <li>Performance metrics by product and category</li>
            <li>Traffic source analysis</li>
            <li>Audience behavior insights</li>
            <li>Revenue tracking capabilities</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}
