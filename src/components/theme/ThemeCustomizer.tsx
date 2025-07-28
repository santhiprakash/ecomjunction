
import React, { useState } from "react";
import { useTheme } from "@/contexts/ThemeContext";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { Palette } from "lucide-react";

export default function ThemeCustomizer() {
  const { theme, updateTheme, resetTheme } = useTheme();
  const [localTheme, setLocalTheme] = useState(theme);
  const [open, setOpen] = useState(false);

  const handleColorChange = (colorType: keyof typeof theme, value: string) => {
    setLocalTheme((prev) => ({ ...prev, [colorType]: value }));
  };

  const handleSave = () => {
    updateTheme(localTheme);
    setOpen(false);
  };

  const handleReset = () => {
    resetTheme();
    setOpen(false);
  };

  const handleOpenChange = (newOpen: boolean) => {
    setOpen(newOpen);
    if (newOpen) {
      setLocalTheme(theme);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <Tooltip>
        <TooltipTrigger asChild>
          <DialogTrigger asChild>
            <Button
              variant="outline"
              size="icon"
              className="relative flex items-center justify-center border-2 border-primary/20 bg-background/80 backdrop-blur-sm hover:bg-primary/10 hover:border-primary/40 transition-all duration-200 shadow-sm hover:shadow-md"
              style={{
                background: `linear-gradient(135deg, ${theme.primaryColor}15, ${theme.secondaryColor}15)`,
                borderColor: `${theme.primaryColor}40`
              }}
            >
              <Palette
                className="h-5 w-5 transition-colors duration-200"
                style={{ color: theme.primaryColor }}
              />
              <div className="absolute -top-1 -right-1 w-3 h-3 rounded-full border-2 border-background"
                   style={{ backgroundColor: theme.accentColor }} />
            </Button>
          </DialogTrigger>
        </TooltipTrigger>
        <TooltipContent>
          <p>Customize Theme Colors</p>
        </TooltipContent>
      </Tooltip>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Customize Theme</DialogTitle>
          <DialogDescription>
            Personalize your store's look and feel with custom colors.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="primaryColor" className="text-right">
              Primary
            </Label>
            <div className="col-span-3 flex items-center gap-2">
              <div
                className="h-6 w-6 rounded-md border-2 border-border shadow-sm"
                style={{
                  backgroundColor: localTheme.primaryColor,
                  borderColor: localTheme.primaryColor === '#FFFFFF' || localTheme.primaryColor === '#ffffff' ? '#e5e7eb' : 'transparent'
                }}
              />
              <Input
                id="primaryColor"
                type="color"
                value={localTheme.primaryColor}
                onChange={(e) => handleColorChange("primaryColor", e.target.value)}
                className="w-16 h-8 p-0"
              />
              <Input
                value={localTheme.primaryColor}
                onChange={(e) => handleColorChange("primaryColor", e.target.value)}
                className="flex-1"
              />
            </div>
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="secondaryColor" className="text-right">
              Secondary
            </Label>
            <div className="col-span-3 flex items-center gap-2">
              <div
                className="h-6 w-6 rounded-md border-2 border-border shadow-sm"
                style={{
                  backgroundColor: localTheme.secondaryColor,
                  borderColor: localTheme.secondaryColor === '#FFFFFF' || localTheme.secondaryColor === '#ffffff' ? '#e5e7eb' : 'transparent'
                }}
              />
              <Input
                id="secondaryColor"
                type="color"
                value={localTheme.secondaryColor}
                onChange={(e) => handleColorChange("secondaryColor", e.target.value)}
                className="w-16 h-8 p-0"
              />
              <Input
                value={localTheme.secondaryColor}
                onChange={(e) => handleColorChange("secondaryColor", e.target.value)}
                className="flex-1"
              />
            </div>
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="accentColor" className="text-right">
              Accent
            </Label>
            <div className="col-span-3 flex items-center gap-2">
              <div
                className="h-6 w-6 rounded-md border-2 border-border shadow-sm"
                style={{
                  backgroundColor: localTheme.accentColor,
                  borderColor: localTheme.accentColor === '#FFFFFF' || localTheme.accentColor === '#ffffff' ? '#e5e7eb' : 'transparent'
                }}
              />
              <Input
                id="accentColor"
                type="color"
                value={localTheme.accentColor}
                onChange={(e) => handleColorChange("accentColor", e.target.value)}
                className="w-16 h-8 p-0"
              />
              <Input
                value={localTheme.accentColor}
                onChange={(e) => handleColorChange("accentColor", e.target.value)}
                className="flex-1"
              />
            </div>
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="textColor" className="text-right">
              Text
            </Label>
            <div className="col-span-3 flex items-center gap-2">
              <div
                className="h-6 w-6 rounded-md border-2 border-border shadow-sm"
                style={{
                  backgroundColor: localTheme.textColor,
                  borderColor: localTheme.textColor === '#FFFFFF' || localTheme.textColor === '#ffffff' ? '#e5e7eb' : 'transparent'
                }}
              />
              <Input
                id="textColor"
                type="color"
                value={localTheme.textColor}
                onChange={(e) => handleColorChange("textColor", e.target.value)}
                className="w-16 h-8 p-0"
              />
              <Input
                value={localTheme.textColor}
                onChange={(e) => handleColorChange("textColor", e.target.value)}
                className="flex-1"
              />
            </div>
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="backgroundColor" className="text-right">
              Background
            </Label>
            <div className="col-span-3 flex items-center gap-2">
              <div
                className="h-6 w-6 rounded-md border-2 border-border shadow-sm"
                style={{
                  backgroundColor: localTheme.backgroundColor,
                  borderColor: localTheme.backgroundColor === '#FFFFFF' || localTheme.backgroundColor === '#ffffff' ? '#e5e7eb' : 'transparent'
                }}
              />
              <Input
                id="backgroundColor"
                type="color"
                value={localTheme.backgroundColor}
                onChange={(e) => handleColorChange("backgroundColor", e.target.value)}
                className="w-16 h-8 p-0"
              />
              <Input
                value={localTheme.backgroundColor}
                onChange={(e) => handleColorChange("backgroundColor", e.target.value)}
                className="flex-1"
              />
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={handleReset}>
            Reset to Default
          </Button>
          <Button onClick={handleSave}>Save Changes</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
