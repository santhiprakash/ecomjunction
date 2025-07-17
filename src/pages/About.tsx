import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function About() {
  const team = [
    {
      name: "Alex Johnson",
      role: "CEO & Founder",
      description: "Former Amazon executive with 10+ years in e-commerce and affiliate marketing."
    },
    {
      name: "Sarah Chen",
      role: "CTO",
      description: "Tech lead with expertise in AI and machine learning, previously at Google."
    },
    {
      name: "Michael Rodriguez",
      role: "Head of Product",
      description: "Product strategist focused on creator economy and influencer marketing tools."
    }
  ];

  const values = [
    {
      title: "Creator-First",
      description: "We build tools that empower creators to succeed and monetize their influence effectively."
    },
    {
      title: "Transparency",
      description: "Clear pricing, honest affiliate disclosures, and transparent reporting on all metrics."
    },
    {
      title: "Innovation",
      description: "Constantly improving our platform with cutting-edge technology and user feedback."
    },
    {
      title: "Community",
      description: "Supporting the creator community with resources, education, and networking opportunities."
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      {/* Hero Section */}
      <div className="bg-gradient-to-b from-primary/10 to-background py-20">
        <div className="container max-w-4xl mx-auto px-4 text-center">
          <h1 className="text-5xl font-bold mb-6">About Shopmatic</h1>
          <p className="text-xl text-muted-foreground mb-8">
            Empowering creators and influencers to monetize their recommendations 
            with the world's most advanced affiliate marketing platform.
          </p>
        </div>
      </div>

      {/* Mission Section */}
      <div className="container max-w-4xl mx-auto px-4 py-20">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold mb-6">Our Mission</h2>
          <p className="text-lg text-muted-foreground leading-relaxed">
            We believe that creators should be able to easily monetize their influence while providing 
            genuine value to their audience. Shopmatic was born from the frustration of managing 
            multiple affiliate programs, tracking performance across platforms, and optimizing 
            product recommendations for maximum revenue.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-12 items-center">
          <div>
            <h3 className="text-2xl font-bold mb-4">The Problem We Solve</h3>
            <p className="text-muted-foreground mb-4">
              Content creators waste countless hours managing affiliate links, tracking performance, 
              and finding the right products to recommend. The existing tools are fragmented, 
              complex, and don't provide the insights needed to maximize earnings.
            </p>
            <p className="text-muted-foreground">
              Shopmatic consolidates everything into one powerful platform, making it easy to 
              discover, manage, and optimize product recommendations.
            </p>
          </div>
          <div>
            <h3 className="text-2xl font-bold mb-4">Our Solution</h3>
            <p className="text-muted-foreground mb-4">
              A comprehensive platform that combines AI-powered product discovery, automated 
              affiliate link management, advanced analytics, and optimization tools in one 
              easy-to-use interface.
            </p>
            <p className="text-muted-foreground">
              We handle the technical complexity so creators can focus on what they do best: 
              creating great content and building authentic relationships with their audience.
            </p>
          </div>
        </div>
      </div>

      {/* Values Section */}
      <div className="bg-muted/50 py-20">
        <div className="container max-w-6xl mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold mb-4">Our Values</h2>
            <p className="text-lg text-muted-foreground">
              The principles that guide everything we do
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {values.map((value, index) => (
              <Card key={index} className="text-center">
                <CardHeader>
                  <CardTitle className="text-xl">{value.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-base">{value.description}</CardDescription>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>

      {/* Team Section */}
      <div className="container max-w-6xl mx-auto px-4 py-20">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold mb-4">Meet Our Team</h2>
          <p className="text-lg text-muted-foreground">
            Experienced professionals dedicated to empowering creators
          </p>
        </div>
        
        <div className="grid md:grid-cols-3 gap-8">
          {team.map((member, index) => (
            <Card key={index} className="text-center">
              <CardHeader>
                <div className="w-24 h-24 bg-gradient-to-br from-primary to-primary/60 rounded-full mx-auto mb-4 flex items-center justify-center text-primary-foreground text-2xl font-bold">
                  {member.name.split(' ').map(n => n[0]).join('')}
                </div>
                <CardTitle className="text-xl">{member.name}</CardTitle>
                <CardDescription className="text-primary font-medium">{member.role}</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">{member.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* CTA Section */}
      <div className="bg-gradient-to-r from-primary to-primary/80 py-20">
        <div className="container max-w-4xl mx-auto px-4 text-center text-primary-foreground">
          <h2 className="text-3xl font-bold mb-4">Join the Creator Economy</h2>
          <p className="text-xl mb-8 opacity-90">
            Ready to transform how you monetize your influence?
          </p>
          <Button size="lg" variant="secondary">
            Get Started Today
          </Button>
        </div>
      </div>

      <Footer />
    </div>
  );
}