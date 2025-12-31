import { useState } from "react";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import SMTPConfigManager from "@/components/profile/SMTPConfigManager";
import AccessibilitySettings from "@/components/accessibility/AccessibilitySettings";
import AffiliateIdManager from "@/components/affiliate/AffiliateIdManager";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import DemoBanner from "@/components/auth/DemoBanner";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import { Settings as SettingsIcon, Mail, Eye, Link2 } from "lucide-react";

function SettingsContent() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<string>("general");

  const settingsTabs = [
    { id: "general", label: "General", icon: SettingsIcon },
    { id: "affiliate", label: "Affiliate IDs", icon: Link2 },
    { id: "smtp", label: "SMTP Settings", icon: Mail },
    { id: "accessibility", label: "Accessibility", icon: Eye },
  ];

  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      
      <main className="flex-1 container max-w-7xl mx-auto py-8 px-4">
        <DemoBanner />
        
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Settings</h1>
          <p className="text-muted-foreground">
            Manage your account settings and preferences
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Sidebar Navigation */}
          <div className="lg:col-span-1">
            <Card>
              <CardContent className="p-2">
                <nav className="space-y-1">
                  {settingsTabs.map((tab) => {
                    const Icon = tab.icon;
                    return (
                      <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`w-full flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                          activeTab === tab.id
                            ? "bg-primary text-primary-foreground"
                            : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                        }`}
                      >
                        <Icon className="h-4 w-4" />
                        {tab.label}
                      </button>
                    );
                  })}
                </nav>
              </CardContent>
            </Card>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            {activeTab === "general" && (
              <Card>
                <CardHeader>
                  <CardTitle>General Settings</CardTitle>
                  <CardDescription>
                    Manage your general account preferences
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="p-4 border rounded-lg">
                      <h3 className="font-medium mb-2">Account Information</h3>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Email:</span>
                          <span>{user?.email}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Plan:</span>
                          <span className="capitalize">{user?.plan || "Free"}</span>
                        </div>
                      </div>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      To update your profile information, visit the{" "}
                      <a href="/profile" className="text-primary hover:underline">
                        Profile page
                      </a>
                      .
                    </p>
                  </div>
                </CardContent>
              </Card>
            )}

            {activeTab === "affiliate" && (
              <Card>
                <CardHeader>
                  <CardTitle>Affiliate ID Management</CardTitle>
                  <CardDescription>
                    Manage your affiliate IDs for different platforms
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <AffiliateIdManager />
                </CardContent>
              </Card>
            )}

            {activeTab === "smtp" && (
              <SMTPConfigManager />
            )}

            {activeTab === "accessibility" && (
              <Card>
                <CardHeader>
                  <CardTitle>Accessibility Settings</CardTitle>
                  <CardDescription>
                    Customize the interface to make it more comfortable for you
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <AccessibilitySettings />
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
}

export default function Settings() {
  return (
    <ProtectedRoute>
      <SettingsContent />
    </ProtectedRoute>
  );
}

