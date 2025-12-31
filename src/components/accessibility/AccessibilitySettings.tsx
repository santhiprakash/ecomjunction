import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { useAccessibility } from "@/contexts/AccessibilityContext";
import { Accessibility, Type, Contrast, Move } from "lucide-react";

export default function AccessibilitySettings() {
  const { settings, setFontSize, setContrastMode, setReducedMotion, resetSettings } = useAccessibility();

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <Accessibility className="h-5 w-5" />
          <CardTitle>Accessibility Settings</CardTitle>
        </div>
        <CardDescription>
          Customize the interface to make it more comfortable for you
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <Type className="h-4 w-4 text-muted-foreground" />
            <Label htmlFor="font-size">Font Size</Label>
          </div>
          <Select value={settings.fontSize} onValueChange={(value) => setFontSize(value as any)}>
            <SelectTrigger id="font-size">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="normal">Normal</SelectItem>
              <SelectItem value="large">Large (1.25x)</SelectItem>
              <SelectItem value="extra-large">Extra Large (1.5x)</SelectItem>
            </SelectContent>
          </Select>
          <p className="text-xs text-muted-foreground">
            Increase text size for better readability
          </p>
        </div>

        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Contrast className="h-4 w-4 text-muted-foreground" />
              <Label htmlFor="high-contrast">High Contrast Mode</Label>
            </div>
            <Switch
              id="high-contrast"
              checked={settings.contrastMode === 'high'}
              onCheckedChange={(checked) => setContrastMode(checked ? 'high' : 'normal')}
            />
          </div>
          <p className="text-xs text-muted-foreground">
            Increase color contrast for better visibility
          </p>
        </div>

        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Move className="h-4 w-4 text-muted-foreground" />
              <Label htmlFor="reduced-motion">Reduce Motion</Label>
            </div>
            <Switch
              id="reduced-motion"
              checked={settings.reducedMotion === 'reduced'}
              onCheckedChange={(checked) => setReducedMotion(checked ? 'reduced' : 'normal')}
            />
          </div>
          <p className="text-xs text-muted-foreground">
            Minimize animations and transitions
          </p>
        </div>

        <div className="pt-4 border-t">
          <Button variant="outline" onClick={resetSettings} className="w-full">
            Reset to Defaults
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

