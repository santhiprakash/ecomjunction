import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { dbHelpers } from '@/lib/neondb';
import { Mail, Lock, Server, Send, AlertCircle, CheckCircle2, Crown, Save } from 'lucide-react';

interface SMTPSetting {
  id: string;
  provider: 'custom' | 'resend' | 'sendgrid';
  settings: Record<string, any>;
  from_email: string;
  from_name?: string;
  is_active: boolean;
}

export default function SMTPConfigManager() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [settings, setSettings] = useState<SMTPSetting[]>([]);
  const [activeTab, setActiveTab] = useState<'custom' | 'resend' | 'sendgrid'>('custom');

  // Custom SMTP form state
  const [customSMTP, setCustomSMTP] = useState({
    host: '',
    port: '587',
    secure: false,
    username: '',
    password: '',
    from_email: '',
    from_name: '',
  });

  // Resend form state
  const [resendSMTP, setResendSMTP] = useState({
    api_key: '',
    from_email: '',
    from_name: '',
  });

  // SendGrid form state
  const [sendgridSMTP, setSendgridSMTP] = useState({
    api_key: '',
    from_email: '',
    from_name: '',
  });

  useEffect(() => {
    if (user && (user.plan === 'pro' || user.plan === 'enterprise')) {
      loadSettings();
    }
  }, [user]);

  const loadSettings = async () => {
    if (!user) return;
    try {
      const data = await dbHelpers.getUserSMTPSettings(user.id);
      setSettings(data || []);

      // Populate form fields with existing settings
      data.forEach((setting: SMTPSetting) => {
        const formSettings = setting.settings || {};
        if (setting.provider === 'custom') {
          setCustomSMTP({
            host: formSettings.host || '',
            port: formSettings.port?.toString() || '587',
            secure: formSettings.secure || false,
            username: formSettings.username || '',
            password: formSettings.password || '',
            from_email: setting.from_email || '',
            from_name: setting.from_name || '',
          });
        } else if (setting.provider === 'resend') {
          setResendSMTP({
            api_key: formSettings.api_key || '',
            from_email: setting.from_email || '',
            from_name: setting.from_name || '',
          });
        } else if (setting.provider === 'sendgrid') {
          setSendgridSMTP({
            api_key: formSettings.api_key || '',
            from_email: setting.from_email || '',
            from_name: setting.from_name || '',
          });
        }
      });
    } catch (error) {
      console.error('Failed to load SMTP settings:', error);
    }
  };

  const handleSaveCustom = async () => {
    if (!user) return;
    if (!customSMTP.host || !customSMTP.port || !customSMTP.username || !customSMTP.password || !customSMTP.from_email) {
      toast.error('Please fill in all required fields');
      return;
    }

    try {
      setLoading(true);
      await dbHelpers.createOrUpdateSMTPSetting(
        user.id,
        'custom',
        {
          host: customSMTP.host,
          port: parseInt(customSMTP.port),
          secure: customSMTP.secure,
          username: customSMTP.username,
          password: customSMTP.password,
        },
        customSMTP.from_email,
        customSMTP.from_name
      );
      toast.success('Custom SMTP settings saved successfully');
      await loadSettings();
    } catch (error) {
      console.error('Failed to save custom SMTP settings:', error);
      toast.error('Failed to save settings');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveResend = async () => {
    if (!user) return;
    if (!resendSMTP.api_key || !resendSMTP.from_email) {
      toast.error('Please fill in all required fields');
      return;
    }

    try {
      setLoading(true);
      await dbHelpers.createOrUpdateSMTPSetting(
        user.id,
        'resend',
        {
          api_key: resendSMTP.api_key,
        },
        resendSMTP.from_email,
        resendSMTP.from_name
      );
      toast.success('Resend settings saved successfully');
      await loadSettings();
    } catch (error) {
      console.error('Failed to save Resend settings:', error);
      toast.error('Failed to save settings');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveSendgrid = async () => {
    if (!user) return;
    if (!sendgridSMTP.api_key || !sendgridSMTP.from_email) {
      toast.error('Please fill in all required fields');
      return;
    }

    try {
      setLoading(true);
      await dbHelpers.createOrUpdateSMTPSetting(
        user.id,
        'sendgrid',
        {
          api_key: sendgridSMTP.api_key,
        },
        sendgridSMTP.from_email,
        sendgridSMTP.from_name
      );
      toast.success('SendGrid settings saved successfully');
      await loadSettings();
    } catch (error) {
      console.error('Failed to save SendGrid settings:', error);
      toast.error('Failed to save settings');
    } finally {
      setLoading(false);
    }
  };

  const handleActivate = async (settingId: string) => {
    if (!user) return;
    try {
      setLoading(true);
      await dbHelpers.activateSMTPSetting(user.id, settingId);
      toast.success('SMTP setting activated');
      await loadSettings();
    } catch (error) {
      console.error('Failed to activate setting:', error);
      toast.error('Failed to activate setting');
    } finally {
      setLoading(false);
    }
  };

  const getActiveSetting = () => {
    return settings.find(s => s.is_active);
  };

  const isPaidPlan = user?.plan === 'pro' || user?.plan === 'enterprise';

  if (!isPaidPlan) {
    return (
      <Card className="opacity-60">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Mail className="h-5 w-5" />
            SMTP Configuration
          </CardTitle>
          <CardDescription>
            Configure custom SMTP settings for email notifications
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            <Lock className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            <p className="font-medium mb-2">Upgrade to Pro or Enterprise</p>
            <p className="text-sm mb-4">
              SMTP configuration is available for paid plans only.
            </p>
            <Button variant="outline" onClick={() => window.location.href = '/pricing'}>
              <Crown className="h-4 w-4 mr-2" />
              View Pricing
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Mail className="h-5 w-5" />
          SMTP Configuration
        </CardTitle>
        <CardDescription>
          Configure your email service provider settings for sending notifications
        </CardDescription>
      </CardHeader>
      <CardContent>
        {getActiveSetting() && (
          <div className="mb-6 p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
            <div className="flex items-center gap-2 text-green-700 dark:text-green-400">
              <CheckCircle2 className="h-5 w-5" />
              <span className="font-medium">
                Active: {getActiveSetting()?.provider.charAt(0).toUpperCase() + getActiveSetting()?.provider.slice(1)} 
                ({getActiveSetting()?.from_email})
              </span>
            </div>
          </div>
        )}

        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as any)}>
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="custom">Custom SMTP</TabsTrigger>
            <TabsTrigger value="resend">Resend</TabsTrigger>
            <TabsTrigger value="sendgrid">SendGrid</TabsTrigger>
          </TabsList>

          <TabsContent value="custom" className="space-y-4 mt-4">
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="host">SMTP Host *</Label>
                  <Input
                    id="host"
                    placeholder="smtp.gmail.com"
                    value={customSMTP.host}
                    onChange={(e) => setCustomSMTP({ ...customSMTP, host: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="port">Port *</Label>
                  <Input
                    id="port"
                    type="number"
                    placeholder="587"
                    value={customSMTP.port}
                    onChange={(e) => setCustomSMTP({ ...customSMTP, port: e.target.value })}
                  />
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  id="secure"
                  checked={customSMTP.secure}
                  onCheckedChange={(checked) => setCustomSMTP({ ...customSMTP, secure: checked })}
                />
                <Label htmlFor="secure">Use SSL/TLS</Label>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="username">Username *</Label>
                  <Input
                    id="username"
                    placeholder="your-email@example.com"
                    value={customSMTP.username}
                    onChange={(e) => setCustomSMTP({ ...customSMTP, username: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password">Password *</Label>
                  <Input
                    id="password"
                    type="password"
                    placeholder="••••••••"
                    value={customSMTP.password}
                    onChange={(e) => setCustomSMTP({ ...customSMTP, password: e.target.value })}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="from_email_custom">From Email *</Label>
                  <Input
                    id="from_email_custom"
                    type="email"
                    placeholder="noreply@example.com"
                    value={customSMTP.from_email}
                    onChange={(e) => setCustomSMTP({ ...customSMTP, from_email: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="from_name_custom">From Name</Label>
                  <Input
                    id="from_name_custom"
                    placeholder="Your Name"
                    value={customSMTP.from_name}
                    onChange={(e) => setCustomSMTP({ ...customSMTP, from_name: e.target.value })}
                  />
                </div>
              </div>

              <Button onClick={handleSaveCustom} disabled={loading} className="w-full">
                <Save className="h-4 w-4 mr-2" />
                Save Custom SMTP Settings
              </Button>
            </div>
          </TabsContent>

          <TabsContent value="resend" className="space-y-4 mt-4">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="resend_api_key">API Key *</Label>
                <Input
                  id="resend_api_key"
                  type="password"
                  placeholder="re_xxxxxxxxxxxx"
                  value={resendSMTP.api_key}
                  onChange={(e) => setResendSMTP({ ...resendSMTP, api_key: e.target.value })}
                />
                <p className="text-xs text-muted-foreground">
                  Get your API key from{' '}
                  <a href="https://resend.com/api-keys" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                    resend.com/api-keys
                  </a>
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="from_email_resend">From Email *</Label>
                  <Input
                    id="from_email_resend"
                    type="email"
                    placeholder="onboarding@resend.dev"
                    value={resendSMTP.from_email}
                    onChange={(e) => setResendSMTP({ ...resendSMTP, from_email: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="from_name_resend">From Name</Label>
                  <Input
                    id="from_name_resend"
                    placeholder="Your Name"
                    value={resendSMTP.from_name}
                    onChange={(e) => setResendSMTP({ ...resendSMTP, from_name: e.target.value })}
                  />
                </div>
              </div>

              <Button onClick={handleSaveResend} disabled={loading} className="w-full">
                <Save className="h-4 w-4 mr-2" />
                Save Resend Settings
              </Button>
            </div>
          </TabsContent>

          <TabsContent value="sendgrid" className="space-y-4 mt-4">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="sendgrid_api_key">API Key *</Label>
                <Input
                  id="sendgrid_api_key"
                  type="password"
                  placeholder="SG.xxxxxxxxxxxx"
                  value={sendgridSMTP.api_key}
                  onChange={(e) => setSendgridSMTP({ ...sendgridSMTP, api_key: e.target.value })}
                />
                <p className="text-xs text-muted-foreground">
                  Get your API key from{' '}
                  <a href="https://app.sendgrid.com/settings/api_keys" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                    SendGrid API Keys
                  </a>
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="from_email_sendgrid">From Email *</Label>
                  <Input
                    id="from_email_sendgrid"
                    type="email"
                    placeholder="noreply@example.com"
                    value={sendgridSMTP.from_email}
                    onChange={(e) => setSendgridSMTP({ ...sendgridSMTP, from_email: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="from_name_sendgrid">From Name</Label>
                  <Input
                    id="from_name_sendgrid"
                    placeholder="Your Name"
                    value={sendgridSMTP.from_name}
                    onChange={(e) => setSendgridSMTP({ ...sendgridSMTP, from_name: e.target.value })}
                  />
                </div>
              </div>

              <Button onClick={handleSaveSendgrid} disabled={loading} className="w-full">
                <Save className="h-4 w-4 mr-2" />
                Save SendGrid Settings
              </Button>
            </div>
          </TabsContent>
        </Tabs>

        {settings.length > 0 && (
          <div className="mt-6 space-y-2">
            <Label>Configured Providers</Label>
            <div className="space-y-2">
              {settings.map((setting) => (
                <div
                  key={setting.id}
                  className="flex items-center justify-between p-3 border rounded-lg"
                >
                  <div className="flex items-center gap-2">
                    <Badge variant={setting.is_active ? 'default' : 'secondary'}>
                      {setting.provider.charAt(0).toUpperCase() + setting.provider.slice(1)}
                    </Badge>
                    <span className="text-sm text-muted-foreground">{setting.from_email}</span>
                  </div>
                  {!setting.is_active && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleActivate(setting.id)}
                      disabled={loading}
                    >
                      Activate
                    </Button>
                  )}
                  {setting.is_active && (
                    <Badge variant="default">
                      <CheckCircle2 className="h-3 w-3 mr-1" />
                      Active
                    </Badge>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

