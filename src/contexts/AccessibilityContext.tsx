import React, { createContext, useState, useContext, useEffect, ReactNode } from 'react';

type FontSize = 'normal' | 'large' | 'extra-large';
type ContrastMode = 'normal' | 'high';
type MotionPreference = 'normal' | 'reduced';

interface AccessibilitySettings {
  fontSize: FontSize;
  contrastMode: ContrastMode;
  reducedMotion: MotionPreference;
}

interface AccessibilityContextType {
  settings: AccessibilitySettings;
  setFontSize: (size: FontSize) => void;
  setContrastMode: (mode: ContrastMode) => void;
  setReducedMotion: (preference: MotionPreference) => void;
  resetSettings: () => void;
}

const defaultSettings: AccessibilitySettings = {
  fontSize: 'normal',
  contrastMode: 'normal',
  reducedMotion: 'normal',
};

const STORAGE_KEY = 'shopmatic-accessibility-settings';

const AccessibilityContext = createContext<AccessibilityContextType | undefined>(undefined);

export const AccessibilityProvider = ({ children }: { children: ReactNode }) => {
  const [settings, setSettings] = useState<AccessibilitySettings>(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        return { ...defaultSettings, ...JSON.parse(saved) };
      } catch {
        return defaultSettings;
      }
    }
    return defaultSettings;
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
    
    // Apply settings to document
    const root = document.documentElement;
    
    // Font size
    root.classList.remove('font-size-normal', 'font-size-large', 'font-size-extra-large');
    root.classList.add(`font-size-${settings.fontSize}`);
    
    // Contrast mode
    root.classList.toggle('high-contrast', settings.contrastMode === 'high');
    
    // Reduced motion
    root.classList.toggle('reduced-motion', settings.reducedMotion === 'reduced');
  }, [settings]);

  const setFontSize = (size: FontSize) => {
    setSettings(prev => ({ ...prev, fontSize: size }));
  };

  const setContrastMode = (mode: ContrastMode) => {
    setSettings(prev => ({ ...prev, contrastMode: mode }));
  };

  const setReducedMotion = (preference: MotionPreference) => {
    setSettings(prev => ({ ...prev, reducedMotion: preference }));
  };

  const resetSettings = () => {
    setSettings(defaultSettings);
  };

  return (
    <AccessibilityContext.Provider
      value={{
        settings,
        setFontSize,
        setContrastMode,
        setReducedMotion,
        resetSettings,
      }}
    >
      {children}
    </AccessibilityContext.Provider>
  );
};

export const useAccessibility = () => {
  const context = useContext(AccessibilityContext);
  if (context === undefined) {
    throw new Error('useAccessibility must be used within an AccessibilityProvider');
  }
  return context;
};

