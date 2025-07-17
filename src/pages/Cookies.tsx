import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";

export default function Cookies() {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="container max-w-4xl mx-auto px-4 py-12">
        <div className="prose prose-gray dark:prose-invert max-w-none">
          <h1 className="text-4xl font-bold mb-8">Cookie Policy</h1>
          <p className="text-muted-foreground mb-6">Last updated: {new Date().toLocaleDateString()}</p>
          
          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">What Are Cookies</h2>
            <p className="mb-4">
              Cookies are small text files that are placed on your computer or mobile device when you visit our website. 
              They are widely used to make websites work more efficiently and provide information to website owners.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">How We Use Cookies</h2>
            <p className="mb-4">We use cookies for several purposes:</p>
            <ul className="list-disc pl-6 mb-4">
              <li><strong>Essential Cookies:</strong> Required for the website to function properly</li>
              <li><strong>Analytics Cookies:</strong> Help us understand how visitors use our website</li>
              <li><strong>Preference Cookies:</strong> Remember your settings and preferences</li>
              <li><strong>Marketing Cookies:</strong> Track affiliate links and conversions</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">Types of Cookies We Use</h2>
            
            <div className="mb-6">
              <h3 className="text-xl font-semibold mb-2">Essential Cookies</h3>
              <p className="mb-2">These cookies are necessary for the website to function and cannot be switched off.</p>
              <ul className="list-disc pl-6 mb-4">
                <li>Authentication and security</li>
                <li>Shopping cart functionality</li>
                <li>Load balancing</li>
              </ul>
            </div>

            <div className="mb-6">
              <h3 className="text-xl font-semibold mb-2">Analytics Cookies</h3>
              <p className="mb-2">These cookies help us improve our website by understanding how it's used.</p>
              <ul className="list-disc pl-6 mb-4">
                <li>Google Analytics</li>
                <li>User behavior tracking</li>
                <li>Performance monitoring</li>
              </ul>
            </div>

            <div className="mb-6">
              <h3 className="text-xl font-semibold mb-2">Marketing Cookies</h3>
              <p className="mb-2">These cookies are used to track affiliate links and advertising effectiveness.</p>
              <ul className="list-disc pl-6 mb-4">
                <li>Affiliate tracking</li>
                <li>Conversion tracking</li>
                <li>Retargeting</li>
              </ul>
            </div>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">Managing Cookies</h2>
            <p className="mb-4">
              You can control and manage cookies in various ways. Most browsers automatically accept cookies, 
              but you can modify your browser settings to decline cookies if you prefer.
            </p>
            <p className="mb-4">
              Please note that if you disable cookies, some features of our website may not function properly.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">Third-Party Cookies</h2>
            <p className="mb-4">
              We may use third-party services that place cookies on your device. These services include:
            </p>
            <ul className="list-disc pl-6 mb-4">
              <li>Google Analytics for website analytics</li>
              <li>Amazon Associates for affiliate tracking</li>
              <li>Social media platforms for sharing functionality</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">Contact Us</h2>
            <p className="mb-4">
              If you have any questions about our use of cookies, please contact us at:
            </p>
            <p className="mb-4">
              Email: <a href="mailto:privacy@shopmatic.cc" className="text-primary hover:underline">privacy@shopmatic.cc</a>
            </p>
          </section>
        </div>
      </div>
      <Footer />
    </div>
  );
}