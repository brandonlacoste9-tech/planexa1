import React, { createContext, useContext, useEffect, useState } from "react";
import { PALETTES, applyPalette, type Palette } from "../themes";

type LightDark = "light" | "dark";

export type CustomColors = {
  primary: string;
  primaryHover: string;
  primaryPale: string;
  bgPage: string;
  border: string;
};

interface ThemeContextType {
  theme: LightDark;
  toggleTheme?: () => void;
  switchable: boolean;
  paletteId: string;
  setPaletteId: (id: string) => void;
  customColors: CustomColors;
  setCustomColors: (c: Partial<CustomColors>) => void;
  activePalette: Palette;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

const DEFAULT_PALETTE_ID = "forest";
const DEFAULT_CUSTOM: CustomColors = {
  primary: "#2D6A4F",
  primaryHover: "#40916C",
  primaryPale: "#D8F3DC",
  bgPage: "#FAF7F2",
  border: "#E8E0D0",
};

interface ThemeProviderProps {
  children: React.ReactNode;
  defaultTheme?: LightDark;
  switchable?: boolean;
}

export function ThemeProvider({
  children,
  defaultTheme = "light",
  switchable = false,
}: ThemeProviderProps) {
  const [theme, setTheme] = useState<LightDark>(() => {
    if (switchable) {
      const stored = localStorage.getItem("theme");
      return (stored as LightDark) || defaultTheme;
    }
    return defaultTheme;
  });

  const [paletteId, setPaletteIdState] = useState<string>(() => {
    return localStorage.getItem("planexa-palette") ?? DEFAULT_PALETTE_ID;
  });

  const [customColors, setCustomColorsState] = useState<CustomColors>(() => {
    try {
      const stored = localStorage.getItem("planexa-custom-colors");
      if (stored) return { ...DEFAULT_CUSTOM, ...JSON.parse(stored) };
    } catch {}
    return DEFAULT_CUSTOM;
  });

  // Apply light/dark class
  useEffect(() => {
    const root = document.documentElement;
    if (theme === "dark") {
      root.classList.add("dark");
    } else {
      root.classList.remove("dark");
    }
    if (switchable) {
      localStorage.setItem("theme", theme);
    }
  }, [theme, switchable]);

  // Apply colour palette on mount and whenever it changes
  useEffect(() => {
    const palette = paletteId === "custom"
      ? { ...PALETTES.find(p => p.id === "custom")!, ...customColors }
      : PALETTES.find(p => p.id === paletteId) ?? PALETTES[0];
    applyPalette(palette);
  }, [paletteId, customColors]);

  const setPaletteId = (id: string) => {
    setPaletteIdState(id);
    localStorage.setItem("planexa-palette", id);
  };

  const setCustomColors = (partial: Partial<CustomColors>) => {
    const next = { ...customColors, ...partial };
    setCustomColorsState(next);
    localStorage.setItem("planexa-custom-colors", JSON.stringify(next));
    // Auto-switch to custom preset
    setPaletteId("custom");
  };

  const toggleTheme = switchable
    ? () => setTheme(prev => (prev === "light" ? "dark" : "light"))
    : undefined;

  const activePalette = paletteId === "custom"
    ? { ...PALETTES.find(p => p.id === "custom")!, ...customColors }
    : PALETTES.find(p => p.id === paletteId) ?? PALETTES[0];

  return (
    <ThemeContext.Provider
      value={{
        theme,
        toggleTheme,
        switchable,
        paletteId,
        setPaletteId,
        customColors,
        setCustomColors,
        activePalette,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useTheme must be used within ThemeProvider");
  }
  return context;
}
