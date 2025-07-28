import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/contexts/AuthContext';
import { Instagram, Twitter, Youtube, Music, Linkedin, Save } from 'lucide-react';

const socialPlatforms = [
  {
    key: 'instagram' as const,
    label: 'Instagram',
    icon: Instagram,
    placeholder: '@username',
    prefix: 'https://instagram.com/',
  },
  {
    key: 'twitter' as const,
    label: 'Twitter/X',
    icon: Twitter,
    placeholder: '@username',
    prefix: 'https://twitter.com/',
  },
  {
    key: 'youtube' as const,
    label: 'YouTube',
    icon: Youtube,
    placeholder: '@channel',
    prefix: 'https://youtube.com/',
  },
  {
    key: 'tiktok' as const,
    label: 'TikTok',
    icon: Music,
    placeholder: '@username',
    prefix: 'https://tiktok.com/',
  },
  {
    key: 'linkedin' as const,
    label: 'LinkedIn',
    icon: Linkedin,
    placeholder: 'username',
    prefix: 'https://linkedin.com/in/',
  },
];

export function SocialLinksForm() {
  const { user, updateSocialLinks } = useAuth();
  const [socialLinks, setSocialLinks] = useState(user?.socialLinks || {});
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      await updateSocialLinks(socialLinks);
    } catch (error) {
      console.error('Failed to update social links:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (platform: string, value: string) => {
    setSocialLinks(prev => ({
      ...prev,
      [platform]: value.trim() || undefined,
    }));
  };

  if (user?.isDemo) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Instagram className="h-5 w-5" />
            Social Media Links
          </CardTitle>
          <CardDescription>
            Connect your social media accounts to display on your showcase page
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            Social media integration is not available in demo mode.
            <br />
            Sign up for a free account to connect your social media handles.
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Instagram className="h-5 w-5" />
          Social Media Links
        </CardTitle>
        <CardDescription>
          Connect your social media accounts to display on your showcase page
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          {socialPlatforms.map(({ key, label, icon: Icon, placeholder, prefix }) => (
            <div key={key} className="space-y-2">
              <Label htmlFor={key} className="flex items-center gap-2">
                <Icon className="h-4 w-4" />
                {label}
              </Label>
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground min-w-fit">
                  {prefix}
                </span>
                <Input
                  id={key}
                  type="text"
                  placeholder={placeholder}
                  value={socialLinks[key] || ''}
                  onChange={(e) => handleInputChange(key, e.target.value)}
                  className="flex-1"
                />
              </div>
            </div>
          ))}
          
          <Button 
            type="submit" 
            disabled={isLoading}
            className="w-full"
          >
            <Save className="h-4 w-4 mr-2" />
            {isLoading ? 'Saving...' : 'Save Social Links'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}