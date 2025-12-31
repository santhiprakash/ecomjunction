import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Progress } from "@/components/ui/progress";
import { useOnboarding } from "@/hooks/use-onboarding";
import { useAuth } from "@/contexts/AuthContext";
import WelcomeStep from "./WelcomeStep";
import ProfileSetupStep from "./ProfileSetupStep";
import AffiliateSetupStep from "./AffiliateSetupStep";
import FirstProductStep from "./FirstProductStep";
import ThemeCustomizationStep from "./ThemeCustomizationStep";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";

const STEPS = [
  { name: "Welcome", component: WelcomeStep },
  { name: "Profile", component: ProfileSetupStep },
  { name: "Affiliate IDs", component: AffiliateSetupStep },
  { name: "First Product", component: FirstProductStep },
  { name: "Theme", component: ThemeCustomizationStep },
];

export default function OnboardingWizard() {
  const { isAuthenticated, isDemo } = useAuth();
  const {
    state,
    nextStep,
    previousStep,
    completeStep,
    completeOnboarding,
    skipOnboarding,
  } = useOnboarding();

  // Don't show if not authenticated, already completed, or skipped
  if (!isAuthenticated || state.completed || state.skipped || isDemo) {
    return null;
  }

  const currentStepIndex = state.currentStep;
  const CurrentStepComponent = STEPS[currentStepIndex].component;
  const progress = ((currentStepIndex + 1) / STEPS.length) * 100;

  const handleNext = () => {
    // Mark current step as completed
    const stepNames: (keyof typeof state.progress)[] = [
      "welcome",
      "profile",
      "affiliate",
      "product",
      "theme",
    ];
    completeStep(stepNames[currentStepIndex]);

    if (currentStepIndex === STEPS.length - 1) {
      completeOnboarding();
    } else {
      nextStep();
    }
  };

  const handleSkip = () => {
    if (currentStepIndex === STEPS.length - 1) {
      completeOnboarding();
    } else {
      skipOnboarding();
    }
  };

  return (
    <Dialog open={true} onOpenChange={() => {}}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="space-y-6">
          {/* Header with progress */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold">
                Step {currentStepIndex + 1} of {STEPS.length}: {STEPS[currentStepIndex].name}
              </h2>
              <Button
                variant="ghost"
                size="icon"
                onClick={skipOnboarding}
                className="h-8 w-8"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
            <Progress value={progress} className="h-2" />
          </div>

          {/* Step content */}
          <div className="min-h-[400px]">
            {currentStepIndex === 0 && (
              <WelcomeStep onNext={handleNext} onSkip={handleSkip} />
            )}
            {currentStepIndex === 1 && (
              <ProfileSetupStep onNext={handleNext} onSkip={handleSkip} />
            )}
            {currentStepIndex === 2 && (
              <AffiliateSetupStep onNext={handleNext} onSkip={handleSkip} />
            )}
            {currentStepIndex === 3 && (
              <FirstProductStep onNext={handleNext} onSkip={handleSkip} />
            )}
            {currentStepIndex === 4 && (
              <ThemeCustomizationStep onComplete={completeOnboarding} onSkip={handleSkip} />
            )}
          </div>

          {/* Navigation (if needed for future enhancements) */}
          {currentStepIndex > 0 && (
            <div className="flex justify-between">
              <Button variant="outline" onClick={previousStep}>
                Previous
              </Button>
              <div></div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

