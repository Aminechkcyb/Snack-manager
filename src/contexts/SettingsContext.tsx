"use client";

import React, { createContext, useContext, ReactNode } from "react";
import { useSettings, AppSettings, COLOR_THEMES, ThemeKey } from "@/hooks/useSettings";

interface SettingsContextType {
    settings: AppSettings;
    updateSettings: (newSettings: Partial<AppSettings>) => void;
    currentTheme: typeof COLOR_THEMES.blue;
    isLoaded: boolean;
}

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

export function SettingsProvider({ children }: { children: ReactNode }) {
    const settingsHook = useSettings();
    const { settings } = settingsHook;

    // Helper to lighten color for gradient/lightBg
    // Since we are client side, we can use simple logic or just use opacity via CSS hex

    // We will inject styles into a root div or style tag
    const customStyle = settings.primaryColor === 'custom' && settings.customColor ? {
        '--theme-color': settings.customColor,
        '--theme-color-soft': `${settings.customColor}40`, // 25% opacity for soft/light
        '--theme-color-light': `color-mix(in srgb, ${settings.customColor}, white 85%)`,
    } as React.CSSProperties : undefined;

    if (!settingsHook.isLoaded) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-50">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-slate-900"></div>
            </div>
        );
    }

    return (
        <SettingsContext.Provider value={settingsHook}>
            <div style={customStyle} className="contents">
                {children}
            </div>
        </SettingsContext.Provider>
    );
}

export function useAppSettings() {
    const context = useContext(SettingsContext);
    if (context === undefined) {
        throw new Error("useAppSettings must be used within a SettingsProvider");
    }
    return context;
}
