import { useState, useEffect } from 'react';

const ONBOARDING_STORAGE_KEY = 'shopmatic-onboarding';
const ONBOARDING_COMPLETED_KEY = 'shopmatic-onboarding-completed';

export interface OnboardingState {
  currentStep: number;
  completed: boolean;
  skipped: boolean;
  progress: {
    welcome: boolean;
    profile: boolean;
    affiliate: boolean;
    product: boolean;
    theme: boolean;
  };
}

const defaultState: OnboardingState = {
  currentStep: 0,
  completed: false,
  skipped: false,
  progress: {
    welcome: false,
    profile: false,
    affiliate: false,
    product: false,
    theme: false,
  },
};

export function useOnboarding() {
  const [state, setState] = useState<OnboardingState>(() => {
    // Check if onboarding was already completed
    const completed = localStorage.getItem(ONBOARDING_COMPLETED_KEY) === 'true';
    if (completed) {
      return { ...defaultState, completed: true };
    }

    // Load saved progress
    const saved = localStorage.getItem(ONBOARDING_STORAGE_KEY);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        return defaultState;
      }
    }
    return defaultState;
  });

  useEffect(() => {
    if (!state.completed && !state.skipped) {
      localStorage.setItem(ONBOARDING_STORAGE_KEY, JSON.stringify(state));
    }
  }, [state]);

  const nextStep = () => {
    setState(prev => ({
      ...prev,
      currentStep: Math.min(prev.currentStep + 1, 4),
    }));
  };

  const previousStep = () => {
    setState(prev => ({
      ...prev,
      currentStep: Math.max(prev.currentStep - 1, 0),
    }));
  };

  const goToStep = (step: number) => {
    setState(prev => ({
      ...prev,
      currentStep: Math.max(0, Math.min(step, 4)),
    }));
  };

  const completeStep = (stepName: keyof OnboardingState['progress']) => {
    setState(prev => ({
      ...prev,
      progress: {
        ...prev.progress,
        [stepName]: true,
      },
    }));
  };

  const completeOnboarding = () => {
    setState(prev => ({
      ...prev,
      completed: true,
      currentStep: 4,
    }));
    localStorage.setItem(ONBOARDING_COMPLETED_KEY, 'true');
    localStorage.removeItem(ONBOARDING_STORAGE_KEY);
  };

  const skipOnboarding = () => {
    setState(prev => ({
      ...prev,
      skipped: true,
      completed: false,
    }));
    localStorage.setItem(ONBOARDING_COMPLETED_KEY, 'true');
    localStorage.removeItem(ONBOARDING_STORAGE_KEY);
  };

  const resetOnboarding = () => {
    setState(defaultState);
    localStorage.removeItem(ONBOARDING_COMPLETED_KEY);
    localStorage.removeItem(ONBOARDING_STORAGE_KEY);
  };

  return {
    state,
    nextStep,
    previousStep,
    goToStep,
    completeStep,
    completeOnboarding,
    skipOnboarding,
    resetOnboarding,
  };
}

