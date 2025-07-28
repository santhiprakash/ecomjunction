import { Link } from "react-router-dom";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import DataManagement from "@/components/compliance/DataManagement";
import AffiliateDisclosure from "@/components/compliance/AffiliateDisclosure";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Shield, Cookie, FileText, ExternalLink } from "lucide-react";

export default function PrivacySettings() {
  const legalLinks = [
    {
      title: "Privacy Policy",
      href: "/privacy-policy",
      description: "How we collect, use, and protect your information",
      icon: FileText
    },
    {
      title: "Terms of Service",
      href: "/terms-of-service",
      description: "Terms and conditions for using our platform",
      icon: FileText
    },
    {
      title: "Cookie Policy",
      href: "/cookies",
      description: "How we use cookies and similar technologies",
      icon: Cookie
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="container max-w-4xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <Link to="/" className="inline-flex items-center gap-2 text-primary hover:underline mb-4">
            <ArrowLeft className="h-4 w-4" />
            Back to Home
          </Link>
          
          <div className="flex items-center gap-3 mb-2">
            <Shield className="h-8 w-8 text-primary" />
            <h1 className="text-3xl font-bold">Privacy & Data Settings</h1>
          </div>
          
          <p className="text-muted-foreground text-lg">
            Manage your privacy preferences and data
          </p>
        </div>

        <div className="space-y-8">
          {/* Data Management Section */}
          <section>
            <DataManagement />
          </section>

          {/* Affiliate Disclosure Section */}
          <section>
            <h2 className="text-2xl font-bold mb-4">Affiliate Disclosure</h2>
            <AffiliateDisclosure variant="modal" />
          </section>

          {/* Legal Documents */}
          <section>
            <h2 className="text-2xl font-bold mb-4">Legal Documents</h2>
            <div className="grid gap-4">
              {legalLinks.map((link, index) => (
                <Card key={index} className="hover:shadow-md transition-shadow">
                  <CardHeader className="pb-3">
                    <CardTitle className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <link.icon className="h-5 w-5 text-primary" />
                        {link.title}
                      </div>
                      <Badge variant="outline">Required</Badge>
                    </CardTitle>
                    <CardDescription>{link.description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Button variant="outline" asChild>
                      <Link to={link.href}>
                        View Document
                        <ExternalLink className="h-4 w-4 ml-2" />
                      </Link>
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </section>

          {/* Privacy Rights */}
          <section>
            <h2 className="text-2xl font-bold mb-4">Your Privacy Rights</h2>
            <Card>
              <CardHeader>
                <CardTitle>Data Protection Rights</CardTitle>
                <CardDescription>
                  Under data protection laws, you have the following rights:
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="grid gap-4">
                    <div className="flex items-start gap-3">
                      <div className="w-2 h-2 bg-primary rounded-full mt-2"></div>
                      <div>
                        <h4 className="font-medium">Right to Access</h4>
                        <p className="text-sm text-muted-foreground">
                          You can request access to your personal data
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-start gap-3">
                      <div className="w-2 h-2 bg-primary rounded-full mt-2"></div>
                      <div>
                        <h4 className="font-medium">Right to Rectification</h4>
                        <p className="text-sm text-muted-foreground">
                          You can correct inaccurate personal data
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-start gap-3">
                      <div className="w-2 h-2 bg-primary rounded-full mt-2"></div>
                      <div>
                        <h4 className="font-medium">Right to Erasure</h4>
                        <p className="text-sm text-muted-foreground">
                          You can request deletion of your personal data
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-start gap-3">
                      <div className="w-2 h-2 bg-primary rounded-full mt-2"></div>
                      <div>
                        <h4 className="font-medium">Right to Portability</h4>
                        <p className="text-sm text-muted-foreground">
                          You can export your data in a machine-readable format
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-start gap-3">
                      <div className="w-2 h-2 bg-primary rounded-full mt-2"></div>
                      <div>
                        <h4 className="font-medium">Right to Object</h4>
                        <p className="text-sm text-muted-foreground">
                          You can object to processing of your personal data
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </section>

          {/* Contact Information */}
          <section className="text-center">
            <h2 className="text-2xl font-bold mb-4">Questions About Privacy?</h2>
            <p className="text-muted-foreground mb-4">
              If you have any questions about your privacy rights or how we handle your data, 
              please don't hesitate to contact us.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button variant="outline" asChild>
                <a href="mailto:privacy@shopmatic.cc">
                  Contact Privacy Team
                </a>
              </Button>
              <Button variant="outline" asChild>
                <Link to="/help-center">
                  Help Center
                </Link>
              </Button>
            </div>
          </section>
        </div>
      </div>
      <Footer />
    </div>
  );
}