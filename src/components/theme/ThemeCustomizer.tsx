
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
      <DialogTrigger asChild>
        <Button variant="outline" size="icon" className="flex items-center justify-center">
          <Palette className="h-5 w-5" />
        </Button>
      </DialogTrigger>
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
                className="h-6 w-6 rounded-md border"
                style={{ backgroundColor: localTheme.primaryColor }}
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
                className="h-6 w-6 rounded-md border"
                style={{ backgroundColor: localTheme.secondaryColor }}
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
                className="h-6 w-6 rounded-md border"
                style={{ backgroundColor: localTheme.accentColor }}
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
                className="h-6 w-6 rounded-md border"
                style={{ backgroundColor: localTheme.textColor }}
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
                className="h-6 w-6 rounded-md border"
                style={{ backgroundColor: localTheme.backgroundColor }}
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
