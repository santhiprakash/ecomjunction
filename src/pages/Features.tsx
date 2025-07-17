import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  ShoppingCart, 
  BarChart3, 
  Zap, 
  Shield, 
  Smartphone, 
  Globe,
  Users,
  Link,
  TrendingUp,
  Search,
  Bell,
  Palette
} from "lucide-react";

export default function Features() {
  const features = [
    {
      icon: <ShoppingCart className="h-8 w-8" />,
      title: "Smart Product Recommendations",
      description: "AI-powered product discovery that finds the best items for your audience"
    },
    {
      icon: <BarChart3 className="h-8 w-8" />,
      title: "Advanced Analytics",
      description: "Track clicks, conversions, and earnings with detailed insights and reports"
    },
    {
      icon: <Link className="h-8 w-8" />,
      title: "Affiliate Link Management",
      description: "Automatically generate and manage affiliate links from multiple networks"
    },
    {
      icon: <TrendingUp className="h-8 w-8" />,
      title: "Performance Tracking",
      description: "Monitor your content performance and optimize for better results"
    },
    {
      icon: <Search className="h-8 w-8" />,
      title: "Product Discovery",
      description: "Find trending products across categories with our powerful search engine"
    },
    {
      icon: <Smartphone className="h-8 w-8" />,
      title: "Mobile Optimized",
      description: "Fully responsive design that works perfectly on all devices"
    },
    {
      icon: <Palette className="h-8 w-8" />,
      title: "Custom Branding",
      description: "Customize your product pages with your own branding and style"
    },
    {
      icon: <Users className="h-8 w-8" />,
      title: "Team Collaboration",
      description: "Work together with your team to create and manage content"
    },
    {
      icon: <Bell className="h-8 w-8" />,
      title: "Smart Notifications",
      description: "Get notified about price drops, new products, and performance updates"
    },
    {
      icon: <Shield className="h-8 w-8" />,
      title: "Enterprise Security",
      description: "Bank-level security with SSL encryption and data protection"
    },
    {
      icon: <Zap className="h-8 w-8" />,
      title: "Lightning Fast",
      description: "Optimized for speed with global CDN and caching"
    },
    {
      icon: <Globe className="h-8 w-8" />,
      title: "Global Reach",
      description: "Support for multiple countries and currencies"
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      {/* Hero Section */}
      <div className="bg-gradient-to-b from-primary/10 to-background py-20">
        <div className="container max-w-6xl mx-auto px-4 text-center">
          <h1 className="text-5xl font-bold mb-6">
            Everything You Need to <span className="text-primary">Monetize</span> Your Influence
          </h1>
          <p className="text-xl text-muted-foreground mb-8 max-w-3xl mx-auto">
            Shopmatic provides all the tools and features you need to create, manage, and optimize 
            your product recommendations for maximum revenue.
          </p>
          <Button size="lg" className="mr-4">
            Start Free Trial
          </Button>
          <Button size="lg" variant="outline">
            Watch Demo
          </Button>
        </div>
      </div>

      {/* Features Grid */}
      <div className="container max-w-6xl mx-auto px-4 py-20">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold mb-4">Powerful Features</h2>
          <p className="text-lg text-muted-foreground">
            Built for influencers, creators, and marketers who want to maximize their earning potential
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <Card key={index} className="border-0 shadow-sm hover:shadow-md transition-shadow">
              <CardHeader>
                <div className="text-primary mb-4">{feature.icon}</div>
                <CardTitle className="text-xl">{feature.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-base">{feature.description}</CardDescription>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* CTA Section */}
      <div className="bg-gradient-to-r from-primary to-primary/80 py-20">
        <div className="container max-w-4xl mx-auto px-4 text-center text-primary-foreground">
          <h2 className="text-3xl font-bold mb-4">Ready to Get Started?</h2>
          <p className="text-xl mb-8 opacity-90">
            Join thousands of creators who are already earning more with Shopmatic
          </p>
          <Button size="lg" variant="secondary">
            Start Your Free Trial
          </Button>
        </div>
      </div>

      <Footer />
    </div>
  );
}