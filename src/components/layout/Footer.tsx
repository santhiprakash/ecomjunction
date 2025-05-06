
import { Link } from "react-router-dom";

export default function Footer() {
  const currentYear = new Date().getFullYear();
  
  return (
    <footer className="border-t bg-background">
      <div className="container px-4 py-8 md:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-4">
          <div>
            <h3 className="text-lg font-semibold">eComJunction</h3>
            <p className="mt-2 text-sm text-muted-foreground">
              The ultimate platform for influencers to showcase and monetize product recommendations.
            </p>
            <p className="mt-4 text-sm text-muted-foreground">
              Shivakrupa Nilayam, TC Palya<br />
              Bengaluru, KA, India - 560036
            </p>
            <p className="mt-2 text-sm text-muted-foreground">
              <a href="mailto:info@ecomjunction.net">info@ecomjunction.net</a>
            </p>
          </div>
          
          <div>
            <h3 className="text-lg font-semibold">Platform</h3>
            <ul className="mt-2 space-y-2 text-sm">
              <li>
                <Link to="/pricing" className="text-muted-foreground hover:text-foreground">
                  Pricing
                </Link>
              </li>
              <li>
                <Link to="/affiliate-programs" className="text-muted-foreground hover:text-foreground">
                  Affiliate Programs
                </Link>
              </li>
              <li>
                <Link to="/integrations" className="text-muted-foreground hover:text-foreground">
                  Integrations
                </Link>
              </li>
              <li>
                <Link to="/features" className="text-muted-foreground hover:text-foreground">
                  Features
                </Link>
              </li>
            </ul>
          </div>
          
          <div>
            <h3 className="text-lg font-semibold">Resources</h3>
            <ul className="mt-2 space-y-2 text-sm">
              <li>
                <Link to="/blog" className="text-muted-foreground hover:text-foreground">
                  Blog
                </Link>
              </li>
              <li>
                <Link to="/guides" className="text-muted-foreground hover:text-foreground">
                  Guides
                </Link>
              </li>
              <li>
                <Link to="/help-center" className="text-muted-foreground hover:text-foreground">
                  Help Center
                </Link>
              </li>
              <li>
                <Link to="/api-documentation" className="text-muted-foreground hover:text-foreground">
                  API Documentation
                </Link>
              </li>
            </ul>
          </div>
          
          <div>
            <h3 className="text-lg font-semibold">Company</h3>
            <ul className="mt-2 space-y-2 text-sm">
              <li>
                <Link to="/about-us" className="text-muted-foreground hover:text-foreground">
                  About Us
                </Link>
              </li>
              <li>
                <Link to="/careers" className="text-muted-foreground hover:text-foreground">
                  Careers
                </Link>
              </li>
              <li>
                <Link to="/privacy-policy" className="text-muted-foreground hover:text-foreground">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link to="/terms-of-service" className="text-muted-foreground hover:text-foreground">
                  Terms of Service
                </Link>
              </li>
            </ul>
          </div>
        </div>
        
        <div className="mt-8 border-t pt-6">
          <div className="text-sm text-muted-foreground">
            <p>
              <strong>Affiliate Disclosure:</strong> As an Amazon Associate and affiliate for other companies, I earn from qualifying purchases. This means I may receive a commission if you click on a link and make a purchase. This does not affect the price you pay.
            </p>
          </div>
          
          <div className="mt-4 flex flex-col items-center justify-between gap-4 sm:flex-row">
            <p className="text-sm text-muted-foreground">
              © {currentYear} eComJunction. All rights reserved.
            </p>
            <div className="flex items-center gap-4">
              <Link to="/privacy" className="text-xs text-muted-foreground hover:text-foreground">
                Privacy
              </Link>
              <Link to="/terms" className="text-xs text-muted-foreground hover:text-foreground">
                Terms
              </Link>
              <Link to="/cookies" className="text-xs text-muted-foreground hover:text-foreground">
                Cookies
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
