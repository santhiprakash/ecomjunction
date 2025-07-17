import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Search, MessageCircle, Book, Video, Mail } from "lucide-react";

export default function Help() {
  const faqs = [
    {
      question: "How do I get started with Shopmatic?",
      answer: "Simply sign up for a free account, complete your profile, and start adding product recommendations. You can begin with our free tier and upgrade as your needs grow."
    },
    {
      question: "How do affiliate commissions work?",
      answer: "When someone clicks your affiliate link and makes a purchase, you earn a commission. Commissions vary by merchant but typically range from 1-10%. We track all clicks and conversions automatically."
    },
    {
      question: "Can I use my existing affiliate accounts?",
      answer: "Yes! You can connect your existing affiliate accounts from Amazon Associates, ShareASale, Commission Junction, and other networks. We'll automatically generate links using your accounts."
    },
    {
      question: "How often are analytics updated?",
      answer: "Analytics are updated in real-time for clicks and impressions. Commission data is updated based on the reporting schedule of each affiliate network, typically within 24-48 hours."
    },
    {
      question: "Is there a mobile app?",
      answer: "Currently, we offer a mobile-responsive web app that works great on all devices. A dedicated mobile app is in development and will be available soon."
    },
    {
      question: "What payment methods do you accept?",
      answer: "We accept all major credit cards (Visa, MasterCard, American Express), PayPal, and bank transfers for enterprise accounts."
    },
    {
      question: "How do I contact support?",
      answer: "You can reach our support team via email at support@shopmatic.cc, through the live chat widget, or by submitting a ticket through your dashboard."
    },
    {
      question: "Can I cancel my subscription anytime?",
      answer: "Yes, you can cancel your subscription at any time. Your access will continue until the end of your current billing period, and you won't be charged again."
    }
  ];

  const resources = [
    {
      icon: <Book className="h-6 w-6" />,
      title: "Getting Started Guide",
      description: "Complete guide to setting up your account and creating your first recommendations"
    },
    {
      icon: <Video className="h-6 w-6" />,
      title: "Video Tutorials",
      description: "Step-by-step video guides covering all features and best practices"
    },
    {
      icon: <MessageCircle className="h-6 w-6" />,
      title: "Community Forum",
      description: "Connect with other creators and share tips, strategies, and experiences"
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      {/* Hero Section */}
      <div className="bg-gradient-to-b from-primary/10 to-background py-20">
        <div className="container max-w-4xl mx-auto px-4 text-center">
          <h1 className="text-5xl font-bold mb-6">Help Center</h1>
          <p className="text-xl text-muted-foreground mb-8">
            Find answers to your questions and learn how to make the most of Shopmatic
          </p>
          
          {/* Search Bar */}
          <div className="relative max-w-md mx-auto">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              placeholder="Search for help..."
              className="pl-10"
            />
          </div>
        </div>
      </div>

      {/* Quick Help Options */}
      <div className="container max-w-6xl mx-auto px-4 py-16">
        <div className="grid md:grid-cols-3 gap-8 mb-16">
          {resources.map((resource, index) => (
            <Card key={index} className="text-center hover:shadow-md transition-shadow cursor-pointer">
              <CardHeader>
                <div className="text-primary mb-4 flex justify-center">{resource.icon}</div>
                <CardTitle className="text-xl">{resource.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-base mb-4">{resource.description}</CardDescription>
                <Button variant="outline">Learn More</Button>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* FAQ Section */}
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12">Frequently Asked Questions</h2>
          
          <Accordion type="single" collapsible className="space-y-4">
            {faqs.map((faq, index) => (
              <AccordionItem key={index} value={`item-${index}`} className="border rounded-lg px-6">
                <AccordionTrigger className="text-left">{faq.question}</AccordionTrigger>
                <AccordionContent className="text-muted-foreground">
                  {faq.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </div>

      {/* Contact Support */}
      <div className="bg-muted/50 py-20">
        <div className="container max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-4">Still Need Help?</h2>
          <p className="text-lg text-muted-foreground mb-8">
            Our support team is here to help you succeed. Get in touch with us.
          </p>
          
          <div className="grid md:grid-cols-2 gap-8 max-w-2xl mx-auto">
            <Card>
              <CardHeader>
                <Mail className="h-8 w-8 text-primary mx-auto mb-2" />
                <CardTitle>Email Support</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground mb-4">Get detailed help via email</p>
                <Button variant="outline" className="w-full">
                  support@shopmatic.cc
                </Button>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <MessageCircle className="h-8 w-8 text-primary mx-auto mb-2" />
                <CardTitle>Live Chat</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground mb-4">Chat with us in real-time</p>
                <Button className="w-full">
                  Start Live Chat
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}