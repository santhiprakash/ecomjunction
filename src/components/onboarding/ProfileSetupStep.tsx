import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { User, FileText } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

interface ProfileSetupStepProps {
  onNext: () => void;
  onSkip: () => void;
}

export default function ProfileSetupStep({ onNext, onSkip }: ProfileSetupStepProps) {
  const { user, updateProfile } = useAuth();
  const [name, setName] = useState(user?.name || "");
  const [bio, setBio] = useState("");

  const handleNext = async () => {
    if (name.trim()) {
      try {
        await updateProfile({ name: name.trim(), bio: bio.trim() || undefined });
        onNext();
      } catch (error) {
        console.error("Failed to update profile:", error);
        onNext(); // Continue even if update fails
      }
    } else {
      onNext(); // Allow skipping name if not provided
    }
  };

  return (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <div className="mx-auto w-16 h-16 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center">
          <User className="h-8 w-8 text-blue-600 dark:text-blue-400" />
        </div>
        <h2 className="text-2xl font-bold">Set Up Your Profile</h2>
        <p className="text-muted-foreground">
          Tell your audience a bit about yourself
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Profile Information</CardTitle>
          <CardDescription>
            This information will be displayed on your showcase page
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Display Name *</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Your name or brand"
            />
            <p className="text-xs text-muted-foreground">
              This is how your audience will see you
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="bio">Bio (Optional)</Label>
            <Textarea
              id="bio"
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              placeholder="Tell your audience about yourself, your interests, or what you recommend..."
              rows={4}
              maxLength={500}
            />
            <p className="text-xs text-muted-foreground">
              {bio.length}/500 characters
            </p>
          </div>
        </CardContent>
      </Card>

      <div className="flex gap-3 justify-center">
        <Button onClick={handleNext} size="lg" className="min-w-[120px]" disabled={!name.trim()}>
          Continue
        </Button>
        <Button onClick={onSkip} variant="ghost" size="lg">
          Skip
        </Button>
      </div>
    </div>
  );
}

