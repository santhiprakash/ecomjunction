
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function Documentation() {
  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      
      <main className="flex-1 container py-6">
        <h1 className="text-3xl font-bold mb-6">eComJunction Documentation</h1>
        
        <Tabs defaultValue="overview">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="features">Features</TabsTrigger>
            <TabsTrigger value="guidelines">Guidelines</TabsTrigger>
          </TabsList>
          
          <TabsContent value="overview" className="space-y-6 mt-6">
            <Card>
              <CardHeader>
                <CardTitle>eComJunction: Affiliate Product Showcase Platform</CardTitle>
                <CardDescription>
                  A SAAS platform for influencers and affiliate marketers
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <p>
                  eComJunction is a powerful SAAS platform designed for influencers and affiliate marketers to showcase and organize their product recommendations. The platform enables users to create personalized showcase pages with their affiliate products, organize them with categories and tags, and share them with their audience.
                </p>
                <h3 className="text-lg font-semibold mt-4">Getting Started</h3>
                <ol className="list-decimal pl-5 space-y-2">
                  <li>Create your account and set up your profile</li>
                  <li>Customize your theme and showcase appearance</li>
                  <li>Add products using our Quick Add feature (just paste a URL!)</li>
                  <li>Organize products with categories and tags</li>
                  <li>Share your showcase page with your audience</li>
                </ol>
                
                <h3 className="text-lg font-semibold mt-4">Quick Add Feature</h3>
                <p>
                  Our AI-powered Quick Add feature automatically extracts product information from any e-commerce URL. Simply paste a product link, and we'll intelligently populate the details including title, description, price, and images.
                </p>
                
                <h3 className="text-lg font-semibold mt-4">Brand Information</h3>
                <ul className="list-disc pl-5 space-y-1">
                  <li><strong>Brand Name:</strong> eComJunction</li>
                  <li><strong>Website:</strong> ecomjunction.net</li>
                  <li><strong>Email:</strong> info@ecomjunction.net</li>
                  <li><strong>Address:</strong> Shivakrupa Nilayam, TC Palya, Bengaluru, KA, India - 560036</li>
                </ul>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="features" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Platform Features</CardTitle>
                <CardDescription>
                  Comprehensive capabilities of the eComJunction platform
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
          </TabsContent>
          
          <TabsContent value="guidelines" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Platform Guidelines</CardTitle>
                <CardDescription>
                  Rules and best practices for using eComJunction
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold">✅ Affiliate Disclosure Requirements</h3>
                  <p className="mt-2">
                    All pages created on eComJunction automatically include an affiliate disclosure in compliance with FTC guidelines and similar regulations worldwide. This disclosure informs visitors that links on the page are affiliate links, and that the page owner may receive a commission from purchases made through these links.
                  </p>
                </div>
                
                <div>
                  <h3 className="text-lg font-semibold">🚫 Prohibited Products</h3>
                  <p className="mt-2">
                    The following types of products are prohibited from being listed on eComJunction:
                  </p>
                  <ul className="list-disc pl-5 space-y-1 mt-2">
                    <li>Illegal goods, services, or content in any jurisdiction</li>
                    <li>Counterfeit or infringing products</li>
                    <li>Weapons, ammunition, and explosives</li>
                    <li>Adult content or sexually explicit material</li>
                    <li>Tobacco, vaping products, and related items</li>
                    <li>Prescription drugs or controlled substances</li>
                    <li>Get-rich-quick schemes and pyramid programs</li>
                    <li>Products making exaggerated health claims</li>
                    <li>Content that promotes discrimination or hate speech</li>
                  </ul>
                </div>
                
                <div>
                  <h3 className="text-lg font-semibold">💡 Best Practices</h3>
                  <ul className="list-disc pl-5 space-y-1 mt-2">
                    <li>Use the Quick Add feature for faster product addition</li>
                    <li>Provide honest and accurate product descriptions</li>
                    <li>Use relevant tags and categories to help users find products</li>
                    <li>Include quality images that represent products accurately</li>
                    <li>Update product information regularly to ensure accuracy</li>
                    <li>Be transparent about product benefits and limitations</li>
                    <li>Check for broken or outdated affiliate links regularly</li>
                  </ul>
                </div>
                
                <div>
                  <h3 className="text-lg font-semibold">⚖️ Compliance Requirements</h3>
                  <p className="mt-2">
                    Users of eComJunction must comply with:
                  </p>
                  <ul className="list-disc pl-5 space-y-1 mt-2">
                    <li>All FTC disclosure requirements and similar regulations in other jurisdictions</li>
                    <li>Terms and conditions of the affiliate programs they promote</li>
                    <li>The platform's terms of service and content guidelines</li>
                    <li>Applicable data protection and privacy laws</li>
                  </ul>
                </div>
                
                <div>
                  <h3 className="text-lg font-semibold">🔧 Technical Requirements</h3>
                  <ul className="list-disc pl-5 space-y-1 mt-2">
                    <li>Valid affiliate URLs from supported platforms</li>
                    <li>OpenAI API key for Quick Add functionality (stored securely in your browser)</li>
                    <li>Modern web browser with JavaScript enabled</li>
                    <li>Stable internet connection for real-time features</li>
                  </ul>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
      
      <Footer />
    </div>
  );
}
