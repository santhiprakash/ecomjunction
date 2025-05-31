
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { APIKeyManager } from "@/utils/apiKeyManager";
import { OpenAIService } from "@/services/OpenAIService";
import { toast } from "sonner";
import { Key, ExternalLink, Check } from "lucide-react";

interface APIKeySetupProps {
  onSetupComplete: () => void;
}

export default function APIKeySetup({ onSetupComplete }: APIKeySetupProps) {
  const [openaiKey, setOpenaiKey] = useState("");
  const [isValidating, setIsValidating] = useState(false);

  const handleSaveKeys = async () => {
    if (!openaiKey.trim()) {
      toast.error("Please enter your OpenAI API key");
      return;
    }

    setIsValidating(true);

    try {
      // Save the key temporarily to test it
      APIKeyManager.setKeys({ openai: openaiKey.trim() });

      // Test the API key
      const isValid = await OpenAIService.isServiceAvailable();

      if (isValid) {
        toast.success("API key validated and saved successfully!");
        onSetupComplete();
      } else {
        APIKeyManager.removeKeys();
        toast.error("Invalid API key. Please check and try again.");
      }
    } catch (error) {
      APIKeyManager.removeKeys();
      toast.error("Failed to validate API key");
    } finally {
      setIsValidating(false);
    }
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Key className="h-5 w-5" />
          API Key Setup
        </CardTitle>
        <CardDescription>
          Configure your OpenAI API key to enable AI-powered product extraction
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <Alert>
          <AlertDescription>
            Your API key is stored securely in your browser's local storage and never sent to our servers.
          </AlertDescription>
        </Alert>

        <div className="space-y-4">
          <div>
            <h3 className="text-sm font-medium mb-2">Get Your OpenAI API Key</h3>
            <ol className="list-decimal list-inside space-y-1 text-sm text-muted-foreground">
              <li>Visit the OpenAI Platform</li>
              <li>Sign up or log in to your account</li>
              <li>Navigate to API Keys section</li>
              <li>Create a new API key</li>
              <li>Copy and paste it below</li>
            </ol>
            <Button variant="outline" size="sm" className="mt-2" asChild>
              <a 
                href="https://platform.openai.com/api-keys" 
                target="_blank" 
                rel="noopener noreferrer"
              >
                <ExternalLink className="mr-2 h-3 w-3" />
                Get OpenAI API Key
              </a>
            </Button>
          </div>

          <div className="space-y-2">
            <label htmlFor="openai-key" className="text-sm font-medium">
              OpenAI API Key *
            </label>
            <Input
              id="openai-key"
              type="password"
              placeholder="sk-..."
              value={openaiKey}
              onChange={(e) => setOpenaiKey(e.target.value)}
              disabled={isValidating}
            />
            <p className="text-xs text-muted-foreground">
              Cost: ~$0.002 per product extraction (very affordable)
            </p>
          </div>
        </div>

        <div className="flex gap-3">
          <Button
            onClick={handleSaveKeys}
            disabled={!openaiKey.trim() || isValidating}
            className="flex-1"
          >
            {isValidating ? (
              <>Validating...</>
            ) : (
              <>
                <Check className="mr-2 h-4 w-4" />
                Save & Validate Key
              </>
            )}
          </Button>
        </div>

        <div className="text-xs text-muted-foreground space-y-1">
          <p><strong>Privacy:</strong> API keys are stored locally in your browser</p>
          <p><strong>Security:</strong> Keys are never transmitted to our servers</p>
          <p><strong>Cost:</strong> You pay OpenAI directly for usage</p>
        </div>
      </CardContent>
    </Card>
  );
}
