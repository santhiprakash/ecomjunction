import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Cookie, Settings, Shield, Info } from 'lucide-react';

interface CookiePreferences {
  essential: boolean;
  analytics: boolean;
  marketing: boolean;
  personalization: boolean;
}

const COOKIE_CONSENT_KEY = 'shopmatic_cookie_consent';
const COOKIE_PREFERENCES_KEY = 'shopmatic_cookie_preferences';

export default function CookieConsent() {
  const [showBanner, setShowBanner] = useState(false);
  const [showPreferences, setShowPreferences] = useState(false);
  const [preferences, setPreferences] = useState<CookiePreferences>({
    essential: true,
    analytics: false,
    marketing: false,
    personalization: false
  });

  useEffect(() => {
    const consent = localStorage.getItem(COOKIE_CONSENT_KEY);
    const storedPreferences = localStorage.getItem(COOKIE_PREFERENCES_KEY);
    
    if (!consent) {
      setShowBanner(true);
    }
    
    if (storedPreferences) {
      try {
        setPreferences(JSON.parse(storedPreferences));
      } catch {
        // Use default preferences if parsing fails
      }
    }
  }, []);

  const handleAcceptAll = () => {
    const allAccepted = {
      essential: true,
      analytics: true,
      marketing: true,
      personalization: true
    };
    
    setPreferences(allAccepted);
    saveCookiePreferences(allAccepted);
    setShowBanner(false);
  };

  const handleAcceptEssential = () => {
    const essentialOnly = {
      essential: true,
      analytics: false,
      marketing: false,
      personalization: false
    };
    
    setPreferences(essentialOnly);
    saveCookiePreferences(essentialOnly);
    setShowBanner(false);
  };

  const handleSavePreferences = () => {
    saveCookiePreferences(preferences);
    setShowBanner(false);
    setShowPreferences(false);
  };

  const saveCookiePreferences = (prefs: CookiePreferences) => {
    localStorage.setItem(COOKIE_CONSENT_KEY, 'true');
    localStorage.setItem(COOKIE_PREFERENCES_KEY, JSON.stringify(prefs));
    
    // Apply preferences to actual cookies/tracking
    applyCookiePreferences(prefs);
  };

  const applyCookiePreferences = (prefs: CookiePreferences) => {
    // Here you would implement actual cookie management
    // For now, we'll just log the preferences
    console.log('Cookie preferences applied:', prefs);
    
    // Example: Disable analytics if not consented
    if (!prefs.analytics) {
      // Disable Google Analytics or other analytics tools
    }
    
    // Example: Disable marketing cookies
    if (!prefs.marketing) {
      // Disable Facebook Pixel, Google Ads, etc.
    }
  };

  const cookieTypes = [
    {
      id: 'essential',
      title: 'Essential Cookies',
      description: 'These cookies are necessary for the website to function and cannot be switched off.',
      required: true,
      examples: ['Authentication', 'Security', 'Load balancing']
    },
    {
      id: 'analytics',
      title: 'Analytics Cookies',
      description: 'These cookies help us understand how visitors interact with our website.',
      required: false,
      examples: ['Page views', 'User behavior', 'Performance metrics']
    },
    {
      id: 'marketing',
      title: 'Marketing Cookies',
      description: 'These cookies are used to track visitors across websites for advertising purposes.',
      required: false,
      examples: ['Ad targeting', 'Conversion tracking', 'Remarketing']
    },
    {
      id: 'personalization',
      title: 'Personalization Cookies',
      description: 'These cookies help us provide a personalized experience based on your preferences.',
      required: false,
      examples: ['Theme preferences', 'Language settings', 'Customization']
    }
  ];

  if (!showBanner) {
    return null;
  }

  return (
    <>
      {/* Cookie Banner */}
      <div className="fixed bottom-0 left-0 right-0 z-50 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 shadow-lg">
        <div className="container mx-auto px-4 py-4">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div className="flex items-start gap-3">
              <Cookie className="h-6 w-6 text-orange-500 flex-shrink-0 mt-0.5" />
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-gray-100">
                  Cookie Consent
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">
                  We use cookies to enhance your experience, analyze site usage, and personalize content. 
                  By clicking "Accept All", you consent to our use of cookies.
                </p>
              </div>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-2 min-w-fit">
              <Dialog open={showPreferences} onOpenChange={setShowPreferences}>
                <DialogTrigger asChild>
                  <Button variant="outline" size="sm">
                    <Settings className="h-4 w-4 mr-2" />
                    Customize
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                      <Cookie className="h-5 w-5" />
                      Cookie Preferences
                    </DialogTitle>
                  </DialogHeader>
                  
                  <div className="space-y-4">
                    <div className="text-sm text-gray-600 dark:text-gray-300">
                      Manage your cookie preferences below. You can change these settings at any time.
                    </div>
                    
                    {cookieTypes.map((type) => (
                      <Card key={type.id} className="border">
                        <CardHeader className="pb-3">
                          <div className="flex items-center justify-between">
                            <CardTitle className="text-base flex items-center gap-2">
                              {type.title}
                              {type.required && <Badge variant="secondary">Required</Badge>}
                            </CardTitle>
                            <Checkbox
                              checked={preferences[type.id as keyof CookiePreferences]}
                              onCheckedChange={(checked) => {
                                if (!type.required) {
                                  setPreferences(prev => ({
                                    ...prev,
                                    [type.id]: checked
                                  }));
                                }
                              }}
                              disabled={type.required}
                            />
                          </div>
                          <CardDescription className="text-sm">
                            {type.description}
                          </CardDescription>
                        </CardHeader>
                        <CardContent className="pt-0">
                          <div className="text-xs text-gray-500 dark:text-gray-400">
                            <strong>Examples:</strong> {type.examples.join(', ')}
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                  
                  <div className="flex justify-end gap-2 pt-4">
                    <Button variant="outline" onClick={() => setShowPreferences(false)}>
                      Cancel
                    </Button>
                    <Button onClick={handleSavePreferences}>
                      Save Preferences
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
              
              <Button variant="outline" size="sm" onClick={handleAcceptEssential}>
                Essential Only
              </Button>
              <Button size="sm" onClick={handleAcceptAll}>
                Accept All
              </Button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

// Hook to check if cookies are consented
export function useCookieConsent() {
  const [hasConsent, setHasConsent] = useState(false);
  const [preferences, setPreferences] = useState<CookiePreferences>({
    essential: true,
    analytics: false,
    marketing: false,
    personalization: false
  });

  useEffect(() => {
    const consent = localStorage.getItem(COOKIE_CONSENT_KEY);
    const storedPreferences = localStorage.getItem(COOKIE_PREFERENCES_KEY);
    
    setHasConsent(!!consent);
    
    if (storedPreferences) {
      try {
        setPreferences(JSON.parse(storedPreferences));
      } catch {
        // Use default preferences
      }
    }
  }, []);

  return { hasConsent, preferences };
}