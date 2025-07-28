
import React, { createContext, useState, useContext, useEffect } from "react";
import { ThemeSettings } from "@/types";

type ThemeContextType = {
  theme: ThemeSettings;
  updateTheme: (newTheme: Partial<ThemeSettings>) => void;
  resetTheme: () => void;
};

const defaultTheme: ThemeSettings = {
  primaryColor: "#6366F1", // indigo-500 - more vibrant and modern
  secondaryColor: "#EC4899", // pink-500 - deeper pink for better contrast
  accentColor: "#059669", // emerald-600 - deeper green for better visibility
  textColor: "#1F2937", // gray-800 - slightly lighter for better readability
  backgroundColor: "#FFFFFF", // white
};

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider = ({ children }: { children: React.ReactNode }) => {
  const [theme, setTheme] = useState<ThemeSettings>(() => {
    // Try to get theme from localStorage
    const savedTheme = localStorage.getItem("shopmatic-theme");
    return savedTheme ? JSON.parse(savedTheme) : defaultTheme;
  });

  // Apply theme to CSS variables
  useEffect(() => {
    // Save theme to localStorage
    localStorage.setItem("shopmatic-theme", JSON.stringify(theme));
    
    // Update CSS variables based on theme
    const root = document.documentElement;
    
    // Convert hex to hsl and set CSS variables
    const hexToHSL = (hex: string) => {
      const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
      if (!result) return "0 0% 0%";
      
      let r = parseInt(result[1], 16);
      let g = parseInt(result[2], 16);
      let b = parseInt(result[3], 16);
      
      r /= 255;
      g /= 255;
      b /= 255;
      
      const max = Math.max(r, g, b);
      const min = Math.min(r, g, b);
      let h = 0, s = 0;
      const l = (max + min) / 2;

      if (max !== min) {
        const d = max - min;
        s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
        switch (max) {
          case r: h = (g - b) / d + (g < b ? 6 : 0); break;
          case g: h = (b - r) / d + 2; break;
          case b: h = (r - g) / d + 4; break;
        }
        h /= 6;
      }

      return `${Math.round(h * 360)} ${Math.round(s * 100)}% ${Math.round(l * 100)}%`;
    };

    root.style.setProperty("--primary", hexToHSL(theme.primaryColor));
    root.style.setProperty("--secondary", hexToHSL(theme.secondaryColor));
    root.style.setProperty("--accent", hexToHSL(theme.accentColor));
    root.style.setProperty("--foreground", hexToHSL(theme.textColor));
    root.style.setProperty("--background", hexToHSL(theme.backgroundColor));
    root.style.setProperty("--brand", hexToHSL(theme.primaryColor));
  }, [theme]);

  const updateTheme = (newTheme: Partial<ThemeSettings>) => {
    setTheme(prevTheme => ({ ...prevTheme, ...newTheme }));
  };

  const resetTheme = () => {
    setTheme(defaultTheme);
  };

  return (
    <ThemeContext.Provider value={{ theme, updateTheme, resetTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
};
