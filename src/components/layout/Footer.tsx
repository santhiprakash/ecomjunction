
import { Link } from "react-router-dom";

export default function Footer() {
  const currentYear = new Date().getFullYear();
  
  return (
    <footer className="border-t bg-white dark:bg-gray-800">
      <div className="container max-w-6xl mx-auto px-4 py-12">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          <div className="col-span-2 md:col-span-1">
            <h3 className="text-lg font-semibold bg-gradient-to-r from-primary to-brand bg-clip-text text-transparent">Shopmatic</h3>
            <p className="mt-2 text-sm text-muted-foreground">
              The ultimate platform for influencers to showcase and monetize product recommendations.
            </p>
            <p className="mt-4 text-sm text-muted-foreground">
              Shivakrupa Nilayam, TC Palya<br />
              Bengaluru, KA, India - 560036
            </p>
            <p className="mt-2 text-sm text-muted-foreground">
              <a href="mailto:info@shopmatic.cc" className="hover:text-primary">info@shopmatic.cc</a>
            </p>
          </div>
          
          <div>
            <h3 className="text-base font-semibold mb-3">Platform</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link to="/pricing" className="text-muted-foreground hover:text-primary transition-colors">
                  Pricing
                </Link>
              </li>
              <li>
                <Link to="/affiliate-programs" className="text-muted-foreground hover:text-primary transition-colors">
                  Affiliate Programs
                </Link>
              </li>
              <li>
                <Link to="/integrations" className="text-muted-foreground hover:text-primary transition-colors">
                  Integrations
                </Link>
              </li>
              <li>
                <Link to="/features" className="text-muted-foreground hover:text-primary transition-colors">
                  Features
                </Link>
              </li>
            </ul>
          </div>
          
          <div>
            <h3 className="text-base font-semibold mb-3">Resources</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link to="/blog" className="text-muted-foreground hover:text-primary transition-colors">
                  Blog
                </Link>
              </li>
              <li>
                <Link to="/guides" className="text-muted-foreground hover:text-primary transition-colors">
                  Guides
                </Link>
              </li>
              <li>
                <Link to="/help-center" className="text-muted-foreground hover:text-primary transition-colors">
                  Help Center
                </Link>
              </li>
              <li>
                <Link to="/api-documentation" className="text-muted-foreground hover:text-primary transition-colors">
                  API Documentation
                </Link>
              </li>
            </ul>
          </div>
          
          <div>
            <h3 className="text-base font-semibold mb-3">Company</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link to="/about-us" className="text-muted-foreground hover:text-primary transition-colors">
                  About Us
                </Link>
              </li>
              <li>
                <Link to="/careers" className="text-muted-foreground hover:text-primary transition-colors">
                  Careers
                </Link>
              </li>
              <li>
                <Link to="/privacy-policy" className="text-muted-foreground hover:text-primary transition-colors">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link to="/terms-of-service" className="text-muted-foreground hover:text-primary transition-colors">
                  Terms of Service
                </Link>
              </li>
            </ul>
          </div>
        </div>
        
        <div className="mt-12 pt-6 border-t">
          <div className="text-sm text-muted-foreground mb-6">
            <p className="max-w-3xl">
              <strong>Affiliate Disclosure:</strong> As an Amazon Associate and affiliate for other companies, I earn from qualifying purchases. This means I may receive a commission if you click on a link and make a purchase. This does not affect the price you pay.
            </p>
          </div>
          
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-sm text-muted-foreground">
              © {currentYear} Shopmatic. All rights reserved.
            </p>
            <div className="flex items-center gap-6">
              <Link to="/privacy" className="text-xs text-muted-foreground hover:text-primary">
                Privacy
              </Link>
              <Link to="/terms" className="text-xs text-muted-foreground hover:text-primary">
                Terms
              </Link>
              <Link to="/cookies" className="text-xs text-muted-foreground hover:text-primary">
                Cookies
              </Link>
              <Link to="/privacy-settings" className="text-xs text-muted-foreground hover:text-primary">
                Privacy Settings
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
