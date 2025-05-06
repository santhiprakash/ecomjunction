
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
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
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="features">Features</TabsTrigger>
            <TabsTrigger value="project-plan">Project Plan</TabsTrigger>
            <TabsTrigger value="progress">Progress</TabsTrigger>
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
                <h3 className="text-lg font-semibold mt-4">Brand Information</h3>
                <ul className="list-disc pl-5 space-y-1">
                  <li><strong>Brand Name:</strong> eComJunction</li>
                  <li><strong>Website:</strong> ecomjunction.net</li>
                  <li><strong>Email:</strong> info@ecomjunction.net</li>
                  <li><strong>Address:</strong> Shivakrupa Nilayam, TC Palya, Bengaluru, KA, India - 560036</li>
                </ul>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Key Components</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h3 className="text-lg font-semibold">User Dashboard</h3>
                  <p>Centralized control panel for affiliates to manage their product showcases, view analytics, and customize their pages.</p>
                </div>
                
                <div>
                  <h3 className="text-lg font-semibold">Product Management</h3>
                  <p>Tools for adding, organizing, and showcasing affiliate products with detailed information.</p>
                </div>
                
                <div>
                  <h3 className="text-lg font-semibold">Customization Options</h3>
                  <p>Personalization features for color schemes, layouts, and branding elements.</p>
                </div>
                
                <div>
                  <h3 className="text-lg font-semibold">Analytics</h3>
                  <p>Tracking and reporting tools to measure performance and engagement.</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="features" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Features</CardTitle>
                <CardDescription>
                  Comprehensive capabilities of the eComJunction platform
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold">Product Showcase</h3>
                  <ul className="list-disc pl-5 space-y-1 mt-2">
                    <li>Grid and list view options for product display</li>
                    <li>Responsive product cards with key information</li>
                    <li>Sorting options (newest, price, rating)</li>
                    <li>Advanced filtering by tags, categories, price range, and rating</li>
                    <li>Search functionality to quickly find products</li>
                  </ul>
                </div>
                
                <div>
                  <h3 className="text-lg font-semibold">Product Management</h3>
                  <ul className="list-disc pl-5 space-y-1 mt-2">
                    <li>Easy addition of products via URL parsing</li>
                    <li>Support for multiple affiliate platforms (Amazon Associates, etc.)</li>
                    <li>Custom tags and categories for organization</li>
                    <li>Product information editing and management</li>
                    <li>Bulk actions for efficient management</li>
                  </ul>
                </div>
                
                <div>
                  <h3 className="text-lg font-semibold">Customization</h3>
                  <ul className="list-disc pl-5 space-y-1 mt-2">
                    <li>Custom color scheme selection</li>
                    <li>Light/dark mode toggle</li>
                    <li>Layout customization options</li>
                    <li>Personal branding elements</li>
                    <li>Custom domain support</li>
                  </ul>
                </div>
                
                <div>
                  <h3 className="text-lg font-semibold">Analytics</h3>
                  <ul className="list-disc pl-5 space-y-1 mt-2">
                    <li>Click tracking and conversion monitoring</li>
                    <li>Performance metrics by product, category, and tag</li>
                    <li>Traffic source analysis</li>
                    <li>Audience behavior insights</li>
                    <li>Custom reporting options</li>
                  </ul>
                </div>
                
                <div>
                  <h3 className="text-lg font-semibold">Compliance and Security</h3>
                  <ul className="list-disc pl-5 space-y-1 mt-2">
                    <li>Automatic affiliate disclosure generation</li>
                    <li>Terms and conditions enforcement</li>
                    <li>Content moderation to prevent unethical/illegal products</li>
                    <li>Data protection and privacy compliance</li>
                    <li>Secure handling of affiliate links and user data</li>
                  </ul>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="project-plan" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Project Implementation Plan</CardTitle>
                <CardDescription>
                  Detailed roadmap for eComJunction development
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <h3 className="text-xl font-semibold">Phase 1: Core Platform</h3>
                  <div className="mt-3 space-y-3">
                    <div>
                      <h4 className="text-lg font-medium">1. Basic UI Implementation</h4>
                      <ul className="list-disc pl-5 space-y-1 mt-1">
                        <li>Design and implement responsive layout</li>
                        <li>Create core components (product cards, lists, filters)</li>
                        <li>Implement basic navigation and site structure</li>
                        <li>Set up theme customization framework</li>
                      </ul>
                    </div>
                    
                    <div>
                      <h4 className="text-lg font-medium">2. Product Management</h4>
                      <ul className="list-disc pl-5 space-y-1 mt-1">
                        <li>Build product addition form and functionality</li>
                        <li>Implement URL parsing for easy product imports</li>
                        <li>Create tag and category management system</li>
                        <li>Add product editing and removal capabilities</li>
                      </ul>
                    </div>
                    
                    <div>
                      <h4 className="text-lg font-medium">3. Search and Filtering</h4>
                      <ul className="list-disc pl-5 space-y-1 mt-1">
                        <li>Develop search functionality</li>
                        <li>Implement filtering by tags, categories, price, and rating</li>
                        <li>Create sorting options</li>
                        <li>Add grid/list view toggle</li>
                      </ul>
                    </div>
                  </div>
                </div>
                
                <div className="mt-4">
                  <h3 className="text-xl font-semibold">Phase 2: User Authentication and Profiles</h3>
                  <div className="mt-3 space-y-3">
                    <div>
                      <h4 className="text-lg font-medium">1. Authentication System</h4>
                      <ul className="list-disc pl-5 space-y-1 mt-1">
                        <li>Implement user registration and login</li>
                        <li>Add email verification and password reset</li>
                        <li>Set up user roles and permissions</li>
                      </ul>
                    </div>
                    
                    <div>
                      <h4 className="text-lg font-medium">2. User Profiles</h4>
                      <ul className="list-disc pl-5 space-y-1 mt-1">
                        <li>Create user profile pages</li>
                        <li>Add profile customization options</li>
                        <li>Implement bio and social media links</li>
                      </ul>
                    </div>
                  </div>
                </div>
                
                <div className="mt-4">
                  <h3 className="text-xl font-semibold">Phase 3: Advanced Features</h3>
                  <div className="mt-3 space-y-3">
                    <div>
                      <h4 className="text-lg font-medium">1. Analytics Dashboard</h4>
                      <ul className="list-disc pl-5 space-y-1 mt-1">
                        <li>Implement basic analytics tracking</li>
                        <li>Create visualization components</li>
                        <li>Add performance reporting</li>
                      </ul>
                    </div>
                    
                    <div>
                      <h4 className="text-lg font-medium">2. Advanced Customization</h4>
                      <ul className="list-disc pl-5 space-y-1 mt-1">
                        <li>Enhance theme customization options</li>
                        <li>Add layout templates</li>
                        <li>Implement custom domain support</li>
                      </ul>
                    </div>
                    
                    <div>
                      <h4 className="text-lg font-medium">3. Compliance and Monetization</h4>
                      <ul className="list-disc pl-5 space-y-1 mt-1">
                        <li>Add automatic affiliate disclosures</li>
                        <li>Implement content moderation</li>
                        <li>Set up subscription plans and billing</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="progress" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Development Progress</CardTitle>
                <CardDescription>
                  Current status of implementation
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h3 className="text-lg font-semibold">Completed Items</h3>
                  <ul className="list-disc pl-5 space-y-1 mt-2">
                    <li>Core UI components and responsive layout</li>
                    <li>Product showcase with grid and list views</li>
                    <li>Search, filtering, and sorting functionality</li>
                    <li>Product management system (add, edit, remove)</li>
                    <li>Theme customization with color picker</li>
                    <li>Tag and category management</li>
                    <li>Basic navigation and layout structure</li>
                    <li>Affiliate disclosure in footer</li>
                  </ul>
                </div>
                
                <div className="mt-4">
                  <h3 className="text-lg font-semibold">In Progress</h3>
                  <ul className="list-disc pl-5 space-y-1 mt-2">
                    <li>User authentication system</li>
                    <li>Enhanced analytics dashboard</li>
                    <li>URL parsing for automated product imports</li>
                  </ul>
                </div>
                
                <div className="mt-4">
                  <h3 className="text-lg font-semibold">Upcoming</h3>
                  <ul className="list-disc pl-5 space-y-1 mt-2">
                    <li>User profiles and personalization</li>
                    <li>Advanced theme customization</li>
                    <li>Subscription and billing system</li>
                    <li>Content moderation tools</li>
                    <li>Custom domain support</li>
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
                  <h3 className="text-lg font-semibold">Affiliate Disclosure Requirements</h3>
                  <p className="mt-2">
                    All pages created on eComJunction automatically include an affiliate disclosure in compliance with FTC guidelines and similar regulations worldwide. This disclosure informs visitors that links on the page are affiliate links, and that the page owner may receive a commission from purchases made through these links.
                  </p>
                </div>
                
                <div>
                  <h3 className="text-lg font-semibold">Prohibited Products</h3>
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
                  <h3 className="text-lg font-semibold">Best Practices</h3>
                  <ul className="list-disc pl-5 space-y-1 mt-2">
                    <li>Provide honest and accurate product descriptions</li>
                    <li>Update product information regularly to ensure accuracy</li>
                    <li>Use relevant tags and categories to help users find products</li>
                    <li>Include quality images that represent products accurately</li>
                    <li>Be transparent about product benefits and limitations</li>
                    <li>Respond to user questions about products when possible</li>
                    <li>Regularly check for broken or outdated affiliate links</li>
                  </ul>
                </div>
                
                <div>
                  <h3 className="text-lg font-semibold">Compliance Requirements</h3>
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
              </CardContent>
              <CardFooter className="bg-muted/50 border-t px-6 py-4">
                <p className="text-sm text-muted-foreground">
                  These guidelines may be updated periodically. Users are responsible for reviewing and adhering to the current version.
                </p>
              </CardFooter>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
      
      <Footer />
    </div>
  );
}
