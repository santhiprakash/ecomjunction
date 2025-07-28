import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Progress } from '@/components/ui/progress';
import { toast } from 'sonner';
import { Download, Trash2, Shield, AlertTriangle, CheckCircle, Info } from 'lucide-react';

interface DataExportProgress {
  step: string;
  progress: number;
  completed: boolean;
}

export default function DataManagement() {
  const [isExporting, setIsExporting] = useState(false);
  const [exportProgress, setExportProgress] = useState<DataExportProgress | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const handleExportData = async () => {
    setIsExporting(true);
    
    try {
      // Step 1: Collect user data
      setExportProgress({
        step: 'Collecting your data...',
        progress: 20,
        completed: false
      });
      
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Step 2: Prepare export
      setExportProgress({
        step: 'Preparing export file...',
        progress: 50,
        completed: false
      });
      
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Step 3: Generate file
      setExportProgress({
        step: 'Generating download...',
        progress: 80,
        completed: false
      });
      
      const userData = {
        exportDate: new Date().toISOString(),
        userData: {
          products: JSON.parse(localStorage.getItem('shopmatic-products') || '[]'),
          theme: JSON.parse(localStorage.getItem('shopmatic-theme') || '{}'),
          cookiePreferences: JSON.parse(localStorage.getItem('shopmatic_cookie_preferences') || '{}'),
          exportedBy: 'Shopmatic Data Export Tool'
        }
      };
      
      // Create and download file
      const blob = new Blob([JSON.stringify(userData, null, 2)], {
        type: 'application/json'
      });
      
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `shopmatic-data-export-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      
      setExportProgress({
        step: 'Export completed!',
        progress: 100,
        completed: true
      });
      
      toast.success('Your data has been exported successfully!');
      
    } catch (error) {
      toast.error('Failed to export data. Please try again.');
      console.error('Export error:', error);
    } finally {
      setIsExporting(false);
      setTimeout(() => setExportProgress(null), 2000);
    }
  };

  const handleDeleteData = async () => {
    setIsDeleting(true);
    
    try {
      // Remove all stored data
      localStorage.removeItem('shopmatic-products');
      localStorage.removeItem('shopmatic-theme');
      localStorage.removeItem('shopmatic_api_keys');
      localStorage.removeItem('shopmatic_encryption_key');
      localStorage.removeItem('shopmatic_cookie_consent');
      localStorage.removeItem('shopmatic_cookie_preferences');
      
      // Clear any other app-specific data
      const keys = Object.keys(localStorage);
      keys.forEach(key => {
        if (key.startsWith('shopmatic') || key.startsWith('shopmatic_')) {
          localStorage.removeItem(key);
        }
      });
      
      toast.success('All your data has been deleted successfully!');
      setShowDeleteConfirm(false);
      
      // Optionally reload the page to reset the app state
      setTimeout(() => {
        window.location.reload();
      }, 1000);
      
    } catch (error) {
      toast.error('Failed to delete data. Please try again.');
      console.error('Delete error:', error);
    } finally {
      setIsDeleting(false);
    }
  };

  const dataTypes = [
    {
      name: 'Product Data',
      description: 'Your saved products, categories, and tags',
      icon: '📦',
      size: 'Variable'
    },
    {
      name: 'Theme Preferences',
      description: 'Your customized theme colors and settings',
      icon: '🎨',
      size: '< 1KB'
    },
    {
      name: 'API Keys',
      description: 'Your encrypted API keys (if configured)',
      icon: '🔐',
      size: '< 1KB'
    },
    {
      name: 'Cookie Preferences',
      description: 'Your cookie consent and preferences',
      icon: '🍪',
      size: '< 1KB'
    }
  ];

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold mb-2">Your Data & Privacy</h2>
        <p className="text-gray-600 dark:text-gray-300">
          Manage your personal data and privacy settings
        </p>
      </div>

      <Alert>
        <Shield className="h-4 w-4" />
        <AlertDescription>
          <strong>Your Privacy Matters:</strong> All data is stored locally in your browser. 
          We never collect or transmit your personal information to external servers.
        </AlertDescription>
      </Alert>

      <div className="grid gap-4">
        {/* Data Overview */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Info className="h-5 w-5" />
              Data Overview
            </CardTitle>
            <CardDescription>
              Here's what data we store locally in your browser
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {dataTypes.map((type, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{type.icon}</span>
                    <div>
                      <div className="font-medium">{type.name}</div>
                      <div className="text-sm text-gray-600 dark:text-gray-300">
                        {type.description}
                      </div>
                    </div>
                  </div>
                  <div className="text-sm text-gray-500 dark:text-gray-400">
                    {type.size}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Export Data */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Download className="h-5 w-5" />
              Export Your Data
            </CardTitle>
            <CardDescription>
              Download a copy of all your data in JSON format
            </CardDescription>
          </CardHeader>
          <CardContent>
            {exportProgress && (
              <div className="mb-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium">{exportProgress.step}</span>
                  <span className="text-sm text-gray-500">{exportProgress.progress}%</span>
                </div>
                <Progress value={exportProgress.progress} className="mb-2" />
                {exportProgress.completed && (
                  <div className="flex items-center gap-2 text-green-600">
                    <CheckCircle className="h-4 w-4" />
                    <span className="text-sm">Your data has been downloaded!</span>
                  </div>
                )}
              </div>
            )}
            
            <Button 
              onClick={handleExportData} 
              disabled={isExporting}
              className="w-full"
            >
              {isExporting ? (
                <>Exporting...</>
              ) : (
                <>
                  <Download className="h-4 w-4 mr-2" />
                  Export My Data
                </>
              )}
            </Button>
          </CardContent>
        </Card>

        {/* Delete Data */}
        <Card className="border-red-200 dark:border-red-800">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-red-600 dark:text-red-400">
              <Trash2 className="h-5 w-5" />
              Delete Your Data
            </CardTitle>
            <CardDescription>
              Permanently delete all your data from this browser
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Alert className="mb-4">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                <strong>Warning:</strong> This action cannot be undone. 
                All your products, settings, and preferences will be permanently deleted.
              </AlertDescription>
            </Alert>
            
            <Dialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
              <DialogTrigger asChild>
                <Button variant="destructive" className="w-full">
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete All My Data
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle className="text-red-600 dark:text-red-400">
                    Confirm Data Deletion
                  </DialogTitle>
                </DialogHeader>
                
                <div className="space-y-4">
                  <Alert>
                    <AlertTriangle className="h-4 w-4" />
                    <AlertDescription>
                      This will permanently delete:
                      <ul className="list-disc list-inside mt-2 space-y-1">
                        <li>All your saved products</li>
                        <li>Theme preferences</li>
                        <li>API keys</li>
                        <li>Cookie preferences</li>
                        <li>Any other app data</li>
                      </ul>
                    </AlertDescription>
                  </Alert>
                  
                  <div className="flex justify-end gap-2">
                    <Button variant="outline" onClick={() => setShowDeleteConfirm(false)}>
                      Cancel
                    </Button>
                    <Button 
                      variant="destructive" 
                      onClick={handleDeleteData}
                      disabled={isDeleting}
                    >
                      {isDeleting ? 'Deleting...' : 'Yes, Delete Everything'}
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}