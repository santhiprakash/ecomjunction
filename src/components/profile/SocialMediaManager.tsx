import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Instagram,
  Twitter,
  Youtube,
  Linkedin,
  ExternalLink,
  Plus,
  Check,
  X,
  Edit,
  Trash2
} from 'lucide-react';

interface SocialMediaHandle {
  platform: string;
  username: string;
  url: string;
  verified?: boolean;
}

const SOCIAL_PLATFORMS = [
  {
    id: 'instagram',
    name: 'Instagram',
    icon: Instagram,
    baseUrl: 'https://instagram.com/',
    placeholder: '@username',
    color: 'bg-gradient-to-r from-purple-500 to-pink-500'
  },
  {
    id: 'twitter',
    name: 'Twitter/X',
    icon: Twitter,
    baseUrl: 'https://twitter.com/',
    placeholder: '@username',
    color: 'bg-blue-500'
  },
  {
    id: 'youtube',
    name: 'YouTube',
    icon: Youtube,
    baseUrl: 'https://youtube.com/@',
    placeholder: '@channelname',
    color: 'bg-red-500'
  },
  {
    id: 'tiktok',
    name: 'TikTok',
    icon: Instagram, // Using Instagram icon as placeholder
    baseUrl: 'https://tiktok.com/@',
    placeholder: '@username',
    color: 'bg-black'
  },
  {
    id: 'linkedin',
    name: 'LinkedIn',
    icon: Linkedin,
    baseUrl: 'https://linkedin.com/in/',
    placeholder: 'username',
    color: 'bg-blue-600'
  }
];

export default function SocialMediaManager() {
  const { user, updateProfile } = useAuth();
  const [open, setOpen] = useState(false);
  const [editingPlatform, setEditingPlatform] = useState<string | null>(null);
  const [socialHandles, setSocialHandles] = useState<Record<string, SocialMediaHandle>>(
    user?.socialLinks || {}
  );
  const [newHandle, setNewHandle] = useState({ platform: '', username: '' });

  const validateUsername = (platform: string, username: string): boolean => {
    if (!username.trim()) return false;
    
    // Remove @ symbol if present
    const cleanUsername = username.replace('@', '');
    
    // Basic validation - alphanumeric, underscores, dots
    const usernameRegex = /^[a-zA-Z0-9._-]+$/;
    return usernameRegex.test(cleanUsername);
  };

  const formatUsername = (platform: string, username: string): string => {
    const cleanUsername = username.replace('@', '');
    const platformConfig = SOCIAL_PLATFORMS.find(p => p.id === platform);
    return platformConfig ? `${platformConfig.baseUrl}${cleanUsername}` : cleanUsername;
  };

  const handleAddSocialHandle = () => {
    if (!newHandle.platform || !newHandle.username) {
      toast.error('Please select a platform and enter a username');
      return;
    }

    if (!validateUsername(newHandle.platform, newHandle.username)) {
      toast.error('Please enter a valid username');
      return;
    }

    const cleanUsername = newHandle.username.replace('@', '');
    const url = formatUsername(newHandle.platform, cleanUsername);
    
    const updatedHandles = {
      ...socialHandles,
      [newHandle.platform]: {
        platform: newHandle.platform,
        username: cleanUsername,
        url,
        verified: false
      }
    };

    setSocialHandles(updatedHandles);
    setNewHandle({ platform: '', username: '' });
    toast.success('Social media handle added successfully!');
  };

  const handleRemoveSocialHandle = (platform: string) => {
    const updatedHandles = { ...socialHandles };
    delete updatedHandles[platform];
    setSocialHandles(updatedHandles);
    toast.success('Social media handle removed');
  };

  const handleSave = async () => {
    try {
      await updateProfile({ socialLinks: socialHandles });
      setOpen(false);
      toast.success('Social media handles updated successfully!');
    } catch (error) {
      toast.error('Failed to update social media handles');
    }
  };

  const getAvailablePlatforms = () => {
    return SOCIAL_PLATFORMS.filter(platform => !socialHandles[platform.id]);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="gap-2">
          <Plus className="h-4 w-4" />
          Manage Social Media
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Social Media Handles</DialogTitle>
          <DialogDescription>
            Connect your social media accounts to display them on your showcase page.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Current Social Handles */}
          <div className="space-y-4">
            <h3 className="text-sm font-medium">Connected Accounts</h3>
            {Object.values(socialHandles).length === 0 ? (
              <p className="text-sm text-muted-foreground">No social media accounts connected yet.</p>
            ) : (
              <div className="space-y-3">
                {Object.values(socialHandles).map((handle) => {
                  const platform = SOCIAL_PLATFORMS.find(p => p.id === handle.platform);
                  if (!platform) return null;

                  const Icon = platform.icon;
                  return (
                    <Card key={handle.platform} className="p-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className={`p-2 rounded-lg ${platform.color} text-white`}>
                            <Icon className="h-4 w-4" />
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-medium">{platform.name}</span>
                              {handle.verified && (
                                <Badge variant="secondary" className="text-xs">
                                  <Check className="h-3 w-3 mr-1" />
                                  Verified
                                </Badge>
                              )}
                            </div>
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                              <span>@{handle.username}</span>
                              <a
                                href={handle.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-primary hover:underline"
                              >
                                <ExternalLink className="h-3 w-3" />
                              </a>
                            </div>
                          </div>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleRemoveSocialHandle(handle.platform)}
                          className="text-destructive hover:text-destructive"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </Card>
                  );
                })}
              </div>
            )}
          </div>

          {/* Add New Handle */}
          {getAvailablePlatforms().length > 0 && (
            <div className="space-y-4">
              <h3 className="text-sm font-medium">Add New Account</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="platform">Platform</Label>
                  <select
                    id="platform"
                    value={newHandle.platform}
                    onChange={(e) => setNewHandle(prev => ({ ...prev, platform: e.target.value }))}
                    className="w-full p-2 border border-input rounded-md bg-background"
                  >
                    <option value="">Select platform</option>
                    {getAvailablePlatforms().map((platform) => (
                      <option key={platform.id} value={platform.id}>
                        {platform.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="username">Username</Label>
                  <Input
                    id="username"
                    placeholder={
                      newHandle.platform
                        ? SOCIAL_PLATFORMS.find(p => p.id === newHandle.platform)?.placeholder
                        : '@username'
                    }
                    value={newHandle.username}
                    onChange={(e) => setNewHandle(prev => ({ ...prev, username: e.target.value }))}
                  />
                </div>
              </div>
              <Button
                onClick={handleAddSocialHandle}
                disabled={!newHandle.platform || !newHandle.username}
                className="w-full"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Social Media Handle
              </Button>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button onClick={handleSave}>
            Save Changes
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
