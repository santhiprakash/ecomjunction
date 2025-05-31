
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { DocumentationOverview } from "@/components/documentation/DocumentationOverview";
import { DocumentationFeatures } from "@/components/documentation/DocumentationFeatures";
import { DocumentationGuidelines } from "@/components/documentation/DocumentationGuidelines";

export default function Documentation() {
  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      
      <main className="flex-1 container py-6">
        <h1 className="text-3xl font-bold mb-6">eComJunction Documentation</h1>
        
        <Tabs defaultValue="overview">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="features">Features</TabsTrigger>
            <TabsTrigger value="guidelines">Guidelines</TabsTrigger>
          </TabsList>
          
          <TabsContent value="overview" className="space-y-6 mt-6">
            <DocumentationOverview />
          </TabsContent>
          
          <TabsContent value="features" className="mt-6">
            <DocumentationFeatures />
          </TabsContent>
          
          <TabsContent value="guidelines" className="mt-6">
            <DocumentationGuidelines />
          </TabsContent>
        </Tabs>
      </main>
      
      <Footer />
    </div>
  );
}
