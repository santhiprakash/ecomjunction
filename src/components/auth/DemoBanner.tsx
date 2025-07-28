import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { Sparkles, X } from 'lucide-react';
import { useState } from 'react';
import AuthModal from './AuthModal';

export default function DemoBanner() {
  const { isDemo } = useAuth();
  const [dismissed, setDismissed] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);

  if (!isDemo || dismissed) {
    return null;
  }

  return (
    <>
      <Alert className="border-blue-200 bg-blue-50 dark:bg-blue-900/20 dark:border-blue-800 relative">
        <Sparkles className="h-4 w-4 text-blue-600" />
        <AlertDescription className="text-blue-800 dark:text-blue-200 pr-8">
          <div className="flex items-center justify-between">
            <div>
              <strong>Demo Mode Active:</strong> You're exploring Shopmatic with sample data. 
              Changes won't be saved. <span className="hidden sm:inline">Create an account to save your progress.</span>
            </div>
            <div className="flex items-center gap-2 ml-4">
              <Button 
                size="sm" 
                variant="outline" 
                className="bg-white/80 hover:bg-white border-blue-300 text-blue-700"
                onClick={() => setShowAuthModal(true)}
              >
                Sign Up
              </Button>
            </div>
          </div>
        </AlertDescription>
        <Button
          variant="ghost"
          size="icon"
          className="absolute top-2 right-2 h-6 w-6 text-blue-600 hover:text-blue-800"
          onClick={() => setDismissed(true)}
        >
          <X className="h-4 w-4" />
        </Button>
      </Alert>

      <AuthModal 
        open={showAuthModal} 
        onOpenChange={setShowAuthModal}
        defaultTab="register"
      />
    </>
  );
}