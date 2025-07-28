import React, { useState, useEffect } from 'react';
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Plus,
  Edit,
  Trash2,
  ExternalLink,
  ShoppingBag,
  Check,
  AlertCircle
} from 'lucide-react';
import { supabaseHelpers } from '@/lib/supabase';

interface AffiliateId {
  id: string;
  platform: string;
  affiliate_id: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

const AFFILIATE_PLATFORMS = [
  {
    id: 'amazon',
    name: 'Amazon Associates',
    description: 'Amazon affiliate program',
    placeholder: 'your-affiliate-tag-20',
    helpText: 'Your Amazon Associate tag (e.g., yourname-20)',
    color: 'bg-orange-500'
  },
  {
    id: 'flipkart',
    name: 'Flipkart Affiliate',
    description: 'Flipkart affiliate program',
    placeholder: 'your-flipkart-id',
    helpText: 'Your Flipkart affiliate ID',
    color: 'bg-blue-500'
  },
  {
    id: 'myntra',
    name: 'Myntra Affiliate',
    description: 'Myntra affiliate program',
    placeholder: 'your-myntra-id',
    helpText: 'Your Myntra affiliate ID',
    color: 'bg-pink-500'
  },
  {
    id: 'nykaa',
    name: 'Nykaa Affiliate',
    description: 'Nykaa affiliate program',
    placeholder: 'your-nykaa-id',
    helpText: 'Your Nykaa affiliate ID',
    color: 'bg-purple-500'
  }
];

export default function AffiliateIdManager() {
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const [affiliateIds, setAffiliateIds] = useState<AffiliateId[]>([]);
  const [loading, setLoading] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    platform: '',
    affiliate_id: ''
  });

  useEffect(() => {
    if (user && !user.isDemo) {
      loadAffiliateIds();
    }
  }, [user]);

  const loadAffiliateIds = async () => {
    if (!user) return;
    
    try {
      setLoading(true);
      const data = await supabaseHelpers.getUserAffiliateIds(user.id);
      setAffiliateIds(data || []);
    } catch (error) {
      console.error('Failed to load affiliate IDs:', error);
      toast.error('Failed to load affiliate IDs');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user || !formData.platform || !formData.affiliate_id.trim()) {
      toast.error('Please fill in all fields');
      return;
    }

    try {
      setLoading(true);
      
      if (editingId) {
        // Update existing affiliate ID
        await supabaseHelpers.updateAffiliateId(editingId, {
          affiliate_id: formData.affiliate_id.trim()
        });
        toast.success('Affiliate ID updated successfully');
      } else {
        // Create new affiliate ID
        await supabaseHelpers.createAffiliateId({
          user_id: user.id,
          platform: formData.platform,
          affiliate_id: formData.affiliate_id.trim()
        });
        toast.success('Affiliate ID added successfully');
      }
      
      await loadAffiliateIds();
      resetForm();
    } catch (error: any) {
      if (error.code === '23505') {
        toast.error('You already have an affiliate ID for this platform');
      } else {
        toast.error('Failed to save affiliate ID');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (affiliateId: AffiliateId) => {
    setEditingId(affiliateId.id);
    setFormData({
      platform: affiliateId.platform,
      affiliate_id: affiliateId.affiliate_id
    });
  };

  const handleDelete = async (id: string) => {
    try {
      setLoading(true);
      await supabaseHelpers.deleteAffiliateId(id);
      await loadAffiliateIds();
      toast.success('Affiliate ID removed');
    } catch (error) {
      toast.error('Failed to remove affiliate ID');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({ platform: '', affiliate_id: '' });
    setEditingId(null);
  };

  const getAvailablePlatforms = () => {
    const usedPlatforms = affiliateIds.map(aid => aid.platform);
    return AFFILIATE_PLATFORMS.filter(platform => 
      !usedPlatforms.includes(platform.id) || (editingId && formData.platform === platform.id)
    );
  };

  const getPlatformInfo = (platformId: string) => {
    return AFFILIATE_PLATFORMS.find(p => p.id === platformId);
  };

  if (user?.isDemo) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ShoppingBag className="h-5 w-5" />
            Affiliate ID Management
          </CardTitle>
          <CardDescription>
            Manage your affiliate IDs for different platforms
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            <AlertCircle className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            <p>Affiliate ID management is not available in demo mode.</p>
            <p className="text-sm">Sign up for a free account to manage your affiliate IDs.</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="gap-2">
          <ShoppingBag className="h-4 w-4" />
          Manage Affiliate IDs
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Affiliate ID Management</DialogTitle>
          <DialogDescription>
            Add and manage your affiliate IDs for different platforms. These will be automatically used when adding products.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Current Affiliate IDs */}
          <div className="space-y-4">
            <h3 className="text-sm font-medium">Your Affiliate IDs</h3>
            {loading && affiliateIds.length === 0 ? (
              <p className="text-sm text-muted-foreground">Loading...</p>
            ) : affiliateIds.length === 0 ? (
              <p className="text-sm text-muted-foreground">No affiliate IDs added yet.</p>
            ) : (
              <div className="space-y-3">
                {affiliateIds.map((affiliateId) => {
                  const platform = getPlatformInfo(affiliateId.platform);
                  if (!platform) return null;

                  return (
                    <Card key={affiliateId.id} className="p-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className={`p-2 rounded-lg ${platform.color} text-white`}>
                            <ShoppingBag className="h-4 w-4" />
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-medium">{platform.name}</span>
                              {affiliateId.is_active && (
                                <Badge variant="secondary" className="text-xs">
                                  <Check className="h-3 w-3 mr-1" />
                                  Active
                                </Badge>
                              )}
                            </div>
                            <p className="text-sm text-muted-foreground font-mono">
                              {affiliateId.affiliate_id}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleEdit(affiliateId)}
                            disabled={loading}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDelete(affiliateId.id)}
                            disabled={loading}
                            className="text-destructive hover:text-destructive"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </Card>
                  );
                })}
              </div>
            )}
          </div>

          {/* Add/Edit Form */}
          {(getAvailablePlatforms().length > 0 || editingId) && (
            <div className="space-y-4">
              <h3 className="text-sm font-medium">
                {editingId ? 'Edit Affiliate ID' : 'Add New Affiliate ID'}
              </h3>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="platform">Platform</Label>
                    <Select
                      value={formData.platform}
                      onValueChange={(value) => setFormData(prev => ({ ...prev, platform: value }))}
                      disabled={!!editingId}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select platform" />
                      </SelectTrigger>
                      <SelectContent>
                        {getAvailablePlatforms().map((platform) => (
                          <SelectItem key={platform.id} value={platform.id}>
                            {platform.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="affiliate_id">Affiliate ID</Label>
                    <Input
                      id="affiliate_id"
                      placeholder={
                        formData.platform
                          ? getPlatformInfo(formData.platform)?.placeholder
                          : 'Enter your affiliate ID'
                      }
                      value={formData.affiliate_id}
                      onChange={(e) => setFormData(prev => ({ ...prev, affiliate_id: e.target.value }))}
                      disabled={loading}
                    />
                  </div>
                </div>
                
                {formData.platform && (
                  <p className="text-xs text-muted-foreground">
                    {getPlatformInfo(formData.platform)?.helpText}
                  </p>
                )}

                <div className="flex gap-2">
                  <Button
                    type="submit"
                    disabled={!formData.platform || !formData.affiliate_id.trim() || loading}
                    className="flex-1"
                  >
                    {loading ? 'Saving...' : editingId ? 'Update' : 'Add'} Affiliate ID
                  </Button>
                  {editingId && (
                    <Button type="button" variant="outline" onClick={resetForm}>
                      Cancel
                    </Button>
                  )}
                </div>
              </form>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
