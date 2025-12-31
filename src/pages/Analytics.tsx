import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import DemoBanner from "@/components/auth/DemoBanner";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart3, TrendingUp, Eye, MousePointerClick, DollarSign, Package } from "lucide-react";

function AnalyticsContent() {
  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      
      <main className="flex-1 container max-w-7xl mx-auto py-6 px-4">
        <DemoBanner />
        
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Analytics</h1>
          <p className="text-muted-foreground">
            Track your product performance and audience engagement
          </p>
        </div>

        {/* Coming Soon Message */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-lg bg-primary/10">
                <BarChart3 className="h-6 w-6 text-primary" />
              </div>
              <div>
                <CardTitle>Analytics Dashboard</CardTitle>
                <CardDescription>
                  Comprehensive analytics coming soon
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              <div className="p-6 bg-muted/50 rounded-lg border-2 border-dashed">
                <div className="text-center space-y-4">
                  <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10">
                    <TrendingUp className="h-8 w-8 text-primary" />
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold mb-2">Analytics Dashboard Coming Soon</h3>
                    <p className="text-muted-foreground max-w-md mx-auto">
                      We're building a comprehensive analytics dashboard to help you track your product performance, 
                      audience engagement, and revenue metrics. Stay tuned!
                    </p>
                  </div>
                </div>
              </div>

              {/* Preview of upcoming features */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-6">
                <Card className="opacity-60">
                  <CardHeader className="pb-3">
                    <div className="flex items-center gap-2">
                      <Eye className="h-5 w-5 text-muted-foreground" />
                      <CardTitle className="text-base">View Analytics</CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground">
                      Track page views and product impressions
                    </p>
                  </CardContent>
                </Card>

                <Card className="opacity-60">
                  <CardHeader className="pb-3">
                    <div className="flex items-center gap-2">
                      <MousePointerClick className="h-5 w-5 text-muted-foreground" />
                      <CardTitle className="text-base">Click Analytics</CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground">
                      Monitor click-through rates and conversions
                    </p>
                  </CardContent>
                </Card>

                <Card className="opacity-60">
                  <CardHeader className="pb-3">
                    <div className="flex items-center gap-2">
                      <DollarSign className="h-5 w-5 text-muted-foreground" />
                      <CardTitle className="text-base">Revenue Tracking</CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground">
                      Track earnings and commission rates
                    </p>
                  </CardContent>
                </Card>

                <Card className="opacity-60">
                  <CardHeader className="pb-3">
                    <div className="flex items-center gap-2">
                      <Package className="h-5 w-5 text-muted-foreground" />
                      <CardTitle className="text-base">Product Performance</CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground">
                      Analyze which products perform best
                    </p>
                  </CardContent>
                </Card>

                <Card className="opacity-60">
                  <CardHeader className="pb-3">
                    <div className="flex items-center gap-2">
                      <TrendingUp className="h-5 w-5 text-muted-foreground" />
                      <CardTitle className="text-base">Trend Analysis</CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground">
                      Identify trending products and categories
                    </p>
                  </CardContent>
                </Card>

                <Card className="opacity-60">
                  <CardHeader className="pb-3">
                    <div className="flex items-center gap-2">
                      <BarChart3 className="h-5 w-5 text-muted-foreground" />
                      <CardTitle className="text-base">Custom Reports</CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground">
                      Generate detailed reports and insights
                    </p>
                  </CardContent>
                </Card>
              </div>
            </div>
          </CardContent>
        </Card>
      </main>
      
      <Footer />
    </div>
  );
}

export default function Analytics() {
  return (
    <ProtectedRoute>
      <AnalyticsContent />
    </ProtectedRoute>
  );
}

