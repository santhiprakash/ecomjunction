
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export function DocumentationOverview() {
  return (
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
  );
}
