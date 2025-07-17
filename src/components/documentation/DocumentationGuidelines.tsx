
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export function DocumentationGuidelines() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Platform Guidelines</CardTitle>
        <CardDescription>
          Rules and best practices for using Shopmatic
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div>
          <h3 className="text-lg font-semibold">✅ Affiliate Disclosure Requirements</h3>
          <p className="mt-2">
            All pages created on Shopmatic automatically include an affiliate disclosure in compliance with FTC guidelines and similar regulations worldwide. This disclosure informs visitors that links on the page are affiliate links, and that the page owner may receive a commission from purchases made through these links.
          </p>
        </div>
        
        <div>
          <h3 className="text-lg font-semibold">🚫 Prohibited Products</h3>
          <p className="mt-2">
            The following types of products are prohibited from being listed on Shopmatic:
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
            Users of Shopmatic must comply with:
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
  );
}
